#![allow(dead_code)]

use std::sync::Arc;

use time::OffsetDateTime;

use crate::{
    application::{
        academic_record_consolidator::consolidate_academic_record,
        academic_progress_parser::{AcademicProgressParser, AcademicProgressParserError},
        morosidad_parser::{MorosidadParser, MorosidadParserError},
        notes_credits_parser::{NotesCreditsParser, NotesCreditsParserError},
        professors_parser::{ProfessorsParser, ProfessorsParserError},
        remote_login_client::{RemoteFetchError, RemoteLoginClient},
        session_repository::{SessionRepository, SessionRepositoryError},
    },
    domain::{academic_progress::AcademicProgress, session::SessionId},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GetStudentAvanceCommand {
    pub session_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GetStudentAvanceError {
    Unauthorized,
    RemoteSessionExpired,
    ParseFailed,
    Upstream,
    Internal,
}

#[derive(Clone)]
pub struct GetStudentAvanceUseCase {
    session_repository: Arc<dyn SessionRepository>,
    remote_login_client: Arc<dyn RemoteLoginClient>,
    avance_parser: Arc<dyn AcademicProgressParser>,
    notes_parser: Arc<dyn NotesCreditsParser>,
    professors_parser: Arc<dyn ProfessorsParser>,
    morosidad_parser: Arc<dyn MorosidadParser>,
}

impl GetStudentAvanceUseCase {
    pub fn new(
        session_repository: Arc<dyn SessionRepository>,
        remote_login_client: Arc<dyn RemoteLoginClient>,
        avance_parser: Arc<dyn AcademicProgressParser>,
        notes_parser: Arc<dyn NotesCreditsParser>,
        professors_parser: Arc<dyn ProfessorsParser>,
        morosidad_parser: Arc<dyn MorosidadParser>,
    ) -> Self {
        Self {
            session_repository,
            remote_login_client,
            avance_parser,
            notes_parser,
            professors_parser,
            morosidad_parser,
        }
    }

    pub async fn execute(
        &self,
        command: GetStudentAvanceCommand,
    ) -> Result<AcademicProgress, GetStudentAvanceError> {
        let session_id = SessionId::try_new(command.session_id).map_err(|_| GetStudentAvanceError::Unauthorized)?;

        let Some(session) = self
            .session_repository
            .find_by_session_id(&session_id)
            .await
            .map_err(map_session_error)?
        else {
            return Err(GetStudentAvanceError::Unauthorized);
        };

        let now = OffsetDateTime::now_utc();
        if !session.authenticated || session.is_expired(now) {
            let _ = self.session_repository.delete(&session_id).await;
            return Err(GetStudentAvanceError::Unauthorized);
        }

        let html = match self.remote_login_client.fetch_avance_html(&session).await {
            Ok(html) => html,
            Err(RemoteFetchError::SessionExpired) => {
                let _ = self.session_repository.delete(&session_id).await;
                return Err(GetStudentAvanceError::RemoteSessionExpired);
            }
            Err(RemoteFetchError::Upstream) => return Err(GetStudentAvanceError::Upstream),
        };

        let parsed_avance = self
            .avance_parser
            .parse(&html)
            .map_err(map_parser_error)?;

        let notas_records = match self.remote_login_client.fetch_notas_html(&session).await {
            Ok(notas_html) => self
                .notes_parser
                .parse(&notas_html)
                .map_err(map_notes_parser_error)
                .unwrap_or_default(),
            Err(RemoteFetchError::SessionExpired) => {
                let _ = self.session_repository.delete(&session_id).await;
                return Err(GetStudentAvanceError::RemoteSessionExpired);
            }
            Err(RemoteFetchError::Upstream) => Vec::new(),
        };

        let professors = match self.remote_login_client.fetch_profesores_html(&session).await {
            Ok(profesores_html) => self
                .professors_parser
                .parse(&profesores_html)
                .map_err(map_professors_parser_error)
                .unwrap_or_default(),
            Err(RemoteFetchError::SessionExpired) => {
                let _ = self.session_repository.delete(&session_id).await;
                return Err(GetStudentAvanceError::RemoteSessionExpired);
            }
            Err(RemoteFetchError::Upstream) => Vec::new(),
        };

        let morosidad = match self.remote_login_client.fetch_morosidad_html(&session).await {
            Ok(morosidad_html) => self
                .morosidad_parser
                .parse(&morosidad_html)
                .map_err(map_morosidad_parser_error)
                .ok(),
            Err(RemoteFetchError::SessionExpired) => {
                let _ = self.session_repository.delete(&session_id).await;
                return Err(GetStudentAvanceError::RemoteSessionExpired);
            }
            Err(RemoteFetchError::Upstream) => None,
        };

        let merged = consolidate_academic_record(parsed_avance, notas_records, professors, morosidad);

        self.session_repository
            .touch_last_used(&session_id, now)
            .await
            .map_err(map_session_error)?;

        Ok(merged)
    }
}

fn map_parser_error(_: AcademicProgressParserError) -> GetStudentAvanceError {
    GetStudentAvanceError::ParseFailed
}

fn map_session_error(_: SessionRepositoryError) -> GetStudentAvanceError {
    GetStudentAvanceError::Internal
}

fn map_notes_parser_error(_: NotesCreditsParserError) -> GetStudentAvanceError {
    GetStudentAvanceError::ParseFailed
}

fn map_professors_parser_error(_: ProfessorsParserError) -> GetStudentAvanceError {
    GetStudentAvanceError::ParseFailed
}

fn map_morosidad_parser_error(_: MorosidadParserError) -> GetStudentAvanceError {
    GetStudentAvanceError::ParseFailed
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use async_trait::async_trait;
    use tokio::sync::RwLock;

    use super::*;
    use crate::{
        application::{
            morosidad_parser::MorosidadParser,
            notes_credits_parser::NotesCreditsParser,
            professors_parser::ProfessorsParser,
            remote_login_client::{RemoteLoginClientError, RemoteLoginCookies, RemoteLoginOutcome},
            session_repository::SessionRepository,
        },
        domain::{
            academic_progress::{AvanceAcademicData, MorosidadRecord, MorosidadStatus, MorosidadSummary, ProfessorRecord, StudentAcademicSummary, SubjectGradeRecord, SubjectRecord},
            credentials::RemoteLoginCredentials,
            session::InternalSession,
        },
    };

    #[derive(Default)]
    struct RepoStub {
        session: RwLock<Option<InternalSession>>,
    }

    #[async_trait]
    impl SessionRepository for RepoStub {
        async fn save(&self, session: InternalSession) -> Result<(), SessionRepositoryError> {
            *self.session.write().await = Some(session);
            Ok(())
        }

        async fn find_by_session_id(
            &self,
            _session_id: &SessionId,
        ) -> Result<Option<InternalSession>, SessionRepositoryError> {
            Ok(self.session.read().await.clone())
        }

        async fn touch_last_used(
            &self,
            _session_id: &SessionId,
            _at: OffsetDateTime,
        ) -> Result<(), SessionRepositoryError> {
            Ok(())
        }

        async fn delete(&self, _session_id: &SessionId) -> Result<(), SessionRepositoryError> {
            *self.session.write().await = None;
            Ok(())
        }

        async fn remove_expired(&self, _now: OffsetDateTime) -> Result<usize, SessionRepositoryError> {
            Ok(0)
        }
    }

    struct RemoteClientStub {
        fetch_result: Result<String, RemoteFetchError>,
        fetch_notas_result: Result<String, RemoteFetchError>,
        fetch_profesores_result: Result<String, RemoteFetchError>,
        fetch_morosidad_result: Result<String, RemoteFetchError>,
    }

    #[async_trait]
    impl crate::application::remote_login_client::RemoteLoginClient for RemoteClientStub {
        async fn login_remote(
            &self,
            _credentials: &RemoteLoginCredentials,
        ) -> Result<RemoteLoginOutcome, RemoteLoginClientError> {
            Ok(RemoteLoginOutcome::Authenticated(RemoteLoginCookies {
                cookiesession1: None,
                jsessionid: None,
                sevup_id: None,
            }))
        }

        async fn fetch_avance_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            self.fetch_result.clone()
        }

        async fn fetch_notas_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            self.fetch_notas_result.clone()
        }

        async fn fetch_profesores_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            self.fetch_profesores_result.clone()
        }

        async fn fetch_morosidad_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            self.fetch_morosidad_result.clone()
        }

        async fn fetch_student_photo(
            &self,
            _session: &InternalSession,
        ) -> Result<
            crate::application::remote_login_client::RemotePhotoPayload,
            crate::application::remote_login_client::RemotePhotoFetchError,
        > {
            Ok(crate::application::remote_login_client::RemotePhotoPayload {
                content_type: Some("image/jpeg".to_string()),
                bytes: vec![0, 1, 2],
            })
        }
    }

    struct AvanceParserStub {
        result: Result<AvanceAcademicData, AcademicProgressParserError>,
    }

    impl AcademicProgressParser for AvanceParserStub {
        fn parse(&self, _html: &str) -> Result<AvanceAcademicData, AcademicProgressParserError> {
            self.result.clone()
        }
    }

    struct NotesParserStub {
        result: Result<Vec<SubjectGradeRecord>, NotesCreditsParserError>,
    }

    impl NotesCreditsParser for NotesParserStub {
        fn parse(&self, _html: &str) -> Result<Vec<SubjectGradeRecord>, NotesCreditsParserError> {
            self.result.clone()
        }
    }

    struct ProfessorsParserStub {
        result: Result<Vec<ProfessorRecord>, ProfessorsParserError>,
    }

    impl ProfessorsParser for ProfessorsParserStub {
        fn parse(&self, _html: &str) -> Result<Vec<ProfessorRecord>, ProfessorsParserError> {
            self.result.clone()
        }
    }

    struct MorosidadParserStub {
        result: Result<MorosidadSummary, MorosidadParserError>,
    }

    impl MorosidadParser for MorosidadParserStub {
        fn parse(&self, _html: &str) -> Result<MorosidadSummary, MorosidadParserError> {
            self.result.clone()
        }
    }

    fn sample_morosidad() -> MorosidadSummary {
        MorosidadSummary {
            year: Some("2026".to_string()),
            current_semester_or_cycle: Some("1".to_string()),
            status: MorosidadStatus::PazYSalvo,
            records: vec![MorosidadRecord {
                message: Some("Paz y Salvo".to_string()),
                balance: None,
            }],
        }
    }

    fn sample_progress() -> AvanceAcademicData {
        AvanceAcademicData {
            student: StudentAcademicSummary {
                name: "RAUL SERRANO".to_string(),
                career: "INGENIERIA".to_string(),
                plan: "0001".to_string(),
                current_index: "1.90".to_string(),
                current_year: "2026".to_string(),
                current_semester: "1".to_string(),
            },
            subjects: vec![SubjectRecord {
                plan_year: Some("1".to_string()),
                plan_semester: Some("1".to_string()),
                code: Some("12345".to_string()),
                name: Some("ALGEBRA".to_string()),
                credits: Some("3".to_string()),
                grade: Some("A".to_string()),
                taken_year: Some("2026".to_string()),
                taken_semester: Some("1".to_string()),
                status: None,
                observation: None,
            }],
        }
    }

    #[tokio::test]
    async fn returns_parsed_progress_for_valid_session() {
        let repo = Arc::new(RepoStub::default());
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.as_str().to_string();
        repo.save(session)
            .await
            .unwrap();

        let use_case = GetStudentAvanceUseCase::new(
            repo,
            Arc::new(RemoteClientStub {
                fetch_result: Ok("<html></html>".to_string()),
                fetch_notas_result: Ok("<html id='tabsCreditComp'></html>".to_string()),
                fetch_profesores_result: Ok("<html></html>".to_string()),
                fetch_morosidad_result: Ok("<html></html>".to_string()),
            }),
            Arc::new(AvanceParserStub {
                result: Ok(sample_progress()),
            }),
            Arc::new(NotesParserStub { result: Ok(vec![]) }),
            Arc::new(ProfessorsParserStub { result: Ok(vec![]) }),
            Arc::new(MorosidadParserStub { result: Ok(sample_morosidad()) }),
        );

        let result = use_case
            .execute(GetStudentAvanceCommand {
                session_id,
            })
            .await
            .unwrap();

        assert_eq!(result.student.name, "RAUL SERRANO");
        assert_eq!(result.subjects.len(), 1);
    }

    #[tokio::test]
    async fn maps_remote_session_expired_error() {
        let repo = Arc::new(RepoStub::default());
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.as_str().to_string();
        repo.save(session).await.unwrap();

        let use_case = GetStudentAvanceUseCase::new(
            repo.clone(),
            Arc::new(RemoteClientStub {
                fetch_result: Err(RemoteFetchError::SessionExpired),
                fetch_notas_result: Ok("<html id='tabsCreditComp'></html>".to_string()),
                fetch_profesores_result: Ok("<html></html>".to_string()),
                fetch_morosidad_result: Ok("<html></html>".to_string()),
            }),
            Arc::new(AvanceParserStub {
                result: Ok(sample_progress()),
            }),
            Arc::new(NotesParserStub { result: Ok(vec![]) }),
            Arc::new(ProfessorsParserStub { result: Ok(vec![]) }),
            Arc::new(MorosidadParserStub { result: Ok(sample_morosidad()) }),
        );

        let result = use_case
            .execute(GetStudentAvanceCommand { session_id })
            .await
            .unwrap_err();

        assert_eq!(result, GetStudentAvanceError::RemoteSessionExpired);
        assert!(repo.session.read().await.is_none());
    }

    #[tokio::test]
    async fn maps_parser_error() {
        let repo = Arc::new(RepoStub::default());
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.as_str().to_string();
        repo.save(session).await.unwrap();

        let use_case = GetStudentAvanceUseCase::new(
            repo,
            Arc::new(RemoteClientStub {
                fetch_result: Ok("<html></html>".to_string()),
                fetch_notas_result: Ok("<html id='tabsCreditComp'></html>".to_string()),
                fetch_profesores_result: Ok("<html></html>".to_string()),
                fetch_morosidad_result: Ok("<html></html>".to_string()),
            }),
            Arc::new(AvanceParserStub {
                result: Err(AcademicProgressParserError),
            }),
            Arc::new(NotesParserStub { result: Ok(vec![]) }),
            Arc::new(ProfessorsParserStub { result: Ok(vec![]) }),
            Arc::new(MorosidadParserStub { result: Ok(sample_morosidad()) }),
        );

        let result = use_case
            .execute(GetStudentAvanceCommand { session_id })
            .await
            .unwrap_err();

        assert_eq!(result, GetStudentAvanceError::ParseFailed);
    }
}

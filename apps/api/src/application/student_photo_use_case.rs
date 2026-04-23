use std::sync::Arc;

use time::OffsetDateTime;

use crate::{
    application::{
        remote_login_client::{RemoteLoginClient, RemotePhotoFetchError, RemotePhotoPayload},
        session_repository::{SessionRepository, SessionRepositoryError},
    },
    domain::session::SessionId,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GetStudentPhotoCommand {
    pub session_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GetStudentPhotoError {
    Unauthorized,
    RemoteSessionExpired,
    NotFound,
    Upstream,
    Internal,
}

#[derive(Clone)]
pub struct GetStudentPhotoUseCase {
    session_repository: Arc<dyn SessionRepository>,
    remote_login_client: Arc<dyn RemoteLoginClient>,
}

impl GetStudentPhotoUseCase {
    pub fn new(
        session_repository: Arc<dyn SessionRepository>,
        remote_login_client: Arc<dyn RemoteLoginClient>,
    ) -> Self {
        Self {
            session_repository,
            remote_login_client,
        }
    }

    pub async fn execute(
        &self,
        command: GetStudentPhotoCommand,
    ) -> Result<RemotePhotoPayload, GetStudentPhotoError> {
        let session_id = SessionId::try_new(command.session_id)
            .map_err(|_| GetStudentPhotoError::Unauthorized)?;

        let Some(session) = self
            .session_repository
            .find_by_session_id(&session_id)
            .await
            .map_err(map_session_error)?
        else {
            return Err(GetStudentPhotoError::Unauthorized);
        };

        let now = OffsetDateTime::now_utc();
        if !session.authenticated || session.is_expired(now) {
            let _ = self.session_repository.delete(&session_id).await;
            return Err(GetStudentPhotoError::Unauthorized);
        }

        let photo = self
            .remote_login_client
            .fetch_student_photo(&session)
            .await
            .map_err(map_remote_error)?;

        self.session_repository
            .touch_last_used(&session_id, now)
            .await
            .map_err(map_session_error)?;

        Ok(photo)
    }
}

fn map_remote_error(error: RemotePhotoFetchError) -> GetStudentPhotoError {
    match error {
        RemotePhotoFetchError::SessionExpired => GetStudentPhotoError::RemoteSessionExpired,
        RemotePhotoFetchError::NotFound => GetStudentPhotoError::NotFound,
        RemotePhotoFetchError::Upstream => GetStudentPhotoError::Upstream,
    }
}

fn map_session_error(_: SessionRepositoryError) -> GetStudentPhotoError {
    GetStudentPhotoError::Internal
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use async_trait::async_trait;
    use tokio::sync::RwLock;

    use super::*;
    use crate::{
        application::{
            remote_login_client::{
                RemoteFetchError, RemoteLoginClientError, RemoteLoginCookies, RemoteLoginOutcome,
            },
            session_repository::SessionRepository,
        },
        domain::{
            credentials::RemoteLoginCredentials,
            session::{InternalSession, SessionId},
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

        async fn remove_expired(
            &self,
            _now: OffsetDateTime,
        ) -> Result<usize, SessionRepositoryError> {
            Ok(0)
        }
    }

    struct RemoteClientStub {
        photo_result: Result<RemotePhotoPayload, RemotePhotoFetchError>,
    }

    #[async_trait]
    impl RemoteLoginClient for RemoteClientStub {
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
            Ok("<html></html>".to_string())
        }

        async fn fetch_notas_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            Ok("<html></html>".to_string())
        }

        async fn fetch_profesores_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            Ok("<html></html>".to_string())
        }

        async fn fetch_morosidad_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, RemoteFetchError> {
            Ok("<html></html>".to_string())
        }

        async fn fetch_student_photo(
            &self,
            _session: &InternalSession,
        ) -> Result<RemotePhotoPayload, RemotePhotoFetchError> {
            self.photo_result.clone()
        }
    }

    #[tokio::test]
    async fn returns_photo_for_valid_session() {
        let repo = Arc::new(RepoStub::default());
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.as_str().to_string();
        repo.save(session).await.unwrap();

        let use_case = GetStudentPhotoUseCase::new(
            repo,
            Arc::new(RemoteClientStub {
                photo_result: Ok(RemotePhotoPayload {
                    content_type: Some("image/jpeg".to_string()),
                    bytes: vec![1, 2, 3],
                }),
            }),
        );

        let result = use_case
            .execute(GetStudentPhotoCommand { session_id })
            .await
            .unwrap();

        assert_eq!(result.content_type.as_deref(), Some("image/jpeg"));
        assert_eq!(result.bytes, vec![1, 2, 3]);
    }

    #[tokio::test]
    async fn returns_unauthorized_when_session_missing() {
        let use_case = GetStudentPhotoUseCase::new(
            Arc::new(RepoStub::default()),
            Arc::new(RemoteClientStub {
                photo_result: Ok(RemotePhotoPayload {
                    content_type: Some("image/jpeg".to_string()),
                    bytes: vec![1],
                }),
            }),
        );

        let result = use_case
            .execute(GetStudentPhotoCommand {
                session_id: SessionId::generate().as_str().to_string(),
            })
            .await;

        assert_eq!(result, Err(GetStudentPhotoError::Unauthorized));
    }

    #[tokio::test]
    async fn maps_not_found_from_remote() {
        let repo = Arc::new(RepoStub::default());
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.as_str().to_string();
        repo.save(session).await.unwrap();

        let use_case = GetStudentPhotoUseCase::new(
            repo,
            Arc::new(RemoteClientStub {
                photo_result: Err(RemotePhotoFetchError::NotFound),
            }),
        );

        let result = use_case
            .execute(GetStudentPhotoCommand { session_id })
            .await;

        assert_eq!(result, Err(GetStudentPhotoError::NotFound));
    }
}

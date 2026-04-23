#![allow(dead_code)]

use std::sync::Arc;

use time::OffsetDateTime;

use crate::{
    application::{
        remote_login_client::{RemoteLoginClient, RemoteLoginClientError, RemoteLoginOutcome},
        session_repository::{SessionRepository, SessionRepositoryError},
    },
    domain::{
        credentials::{CredentialValidationError, RemoteLoginCredentials},
        session::{InternalSession, SessionId},
    },
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoginCommand {
    pub provincia: String,
    pub clase: String,
    pub tomo: String,
    pub folio: String,
    pub password: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoginResult {
    pub session_id: String,
    pub authenticated: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LoginUseCaseError {
    InvalidInput(CredentialValidationError),
    InvalidCredentials,
    RemoteClient(RemoteLoginClientError),
    SessionStore(SessionRepositoryError),
}

#[derive(Clone)]
pub struct LoginUseCase {
    session_repository: Arc<dyn SessionRepository>,
    remote_login_client: Arc<dyn RemoteLoginClient>,
}

impl LoginUseCase {
    pub fn new(
        session_repository: Arc<dyn SessionRepository>,
        remote_login_client: Arc<dyn RemoteLoginClient>,
    ) -> Self {
        Self {
            session_repository,
            remote_login_client,
        }
    }

    pub async fn execute(&self, command: LoginCommand) -> Result<LoginResult, LoginUseCaseError> {
        let credentials = RemoteLoginCredentials::try_new(
            &command.provincia,
            &command.clase,
            &command.tomo,
            &command.folio,
            &command.password,
        )
        .map_err(LoginUseCaseError::InvalidInput)?;

        let remote_outcome = self
            .remote_login_client
            .login_remote(&credentials)
            .await
            .map_err(LoginUseCaseError::RemoteClient)?;

        let remote_cookies = match remote_outcome {
            RemoteLoginOutcome::Authenticated(cookies) => cookies,
            RemoteLoginOutcome::InvalidCredentials => {
                return Err(LoginUseCaseError::InvalidCredentials)
            }
        };

        let now = OffsetDateTime::now_utc();
        let session_id = SessionId::generate();
        let session = InternalSession::new(session_id.clone(), now)
            .with_remote_cookies(
                remote_cookies.cookiesession1,
                remote_cookies.jsessionid,
                remote_cookies.sevup_id,
            )
            .with_authenticated(true);

        self.session_repository
            .save(session)
            .await
            .map_err(LoginUseCaseError::SessionStore)?;

        Ok(LoginResult {
            session_id: session_id.as_str().to_string(),
            authenticated: true,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use tokio::sync::RwLock;

    #[derive(Default)]
    struct InMemoryRepo {
        saved: RwLock<Vec<InternalSession>>,
    }

    #[async_trait]
    impl SessionRepository for InMemoryRepo {
        async fn save(&self, session: InternalSession) -> Result<(), SessionRepositoryError> {
            self.saved.write().await.push(session);
            Ok(())
        }

        async fn find_by_session_id(
            &self,
            _session_id: &SessionId,
        ) -> Result<Option<InternalSession>, SessionRepositoryError> {
            Ok(None)
        }

        async fn touch_last_used(
            &self,
            _session_id: &SessionId,
            _at: OffsetDateTime,
        ) -> Result<(), SessionRepositoryError> {
            Ok(())
        }

        async fn delete(&self, _session_id: &SessionId) -> Result<(), SessionRepositoryError> {
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
        outcome: Result<RemoteLoginOutcome, RemoteLoginClientError>,
    }

    #[async_trait]
    impl RemoteLoginClient for RemoteClientStub {
        async fn login_remote(
            &self,
            _credentials: &RemoteLoginCredentials,
        ) -> Result<RemoteLoginOutcome, RemoteLoginClientError> {
            self.outcome.clone()
        }

        async fn fetch_avance_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, crate::application::remote_login_client::RemoteFetchError> {
            unreachable!("not used in login use case tests")
        }

        async fn fetch_notas_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, crate::application::remote_login_client::RemoteFetchError> {
            unreachable!("not used in login use case tests")
        }

        async fn fetch_profesores_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, crate::application::remote_login_client::RemoteFetchError> {
            unreachable!("not used in login use case tests")
        }

        async fn fetch_morosidad_html(
            &self,
            _session: &InternalSession,
        ) -> Result<String, crate::application::remote_login_client::RemoteFetchError> {
            unreachable!("not used in login use case tests")
        }

        async fn fetch_student_photo(
            &self,
            _session: &InternalSession,
        ) -> Result<
            crate::application::remote_login_client::RemotePhotoPayload,
            crate::application::remote_login_client::RemotePhotoFetchError,
        > {
            unreachable!("not used in login use case tests")
        }
    }

    fn command() -> LoginCommand {
        LoginCommand {
            provincia: "06".to_string(),
            clase: "00".to_string(),
            tomo: "0723".to_string(),
            folio: "00584".to_string(),
            password: "secret".to_string(),
        }
    }

    #[tokio::test]
    async fn execute_returns_safe_result_and_persists_internal_session() {
        let repo = Arc::new(InMemoryRepo::default());
        let remote = Arc::new(RemoteClientStub {
            outcome: Ok(RemoteLoginOutcome::Authenticated(
                crate::application::remote_login_client::RemoteLoginCookies {
                    cookiesession1: Some("cookie-1".to_string()),
                    jsessionid: Some("j-session".to_string()),
                    sevup_id: Some("sevup-id".to_string()),
                },
            )),
        });

        let use_case = LoginUseCase::new(repo.clone(), remote);
        let result = use_case.execute(command()).await.unwrap();

        assert!(result.authenticated);
        assert!(!result.session_id.is_empty());

        let saved = repo.saved.read().await;
        assert_eq!(saved.len(), 1);
        assert!(saved[0].authenticated);
        assert_eq!(saved[0].cookiesession1.as_deref(), Some("cookie-1"));
        assert_eq!(saved[0].jsessionid.as_deref(), Some("j-session"));
        assert_eq!(saved[0].sevup_id.as_deref(), Some("sevup-id"));
    }

    #[tokio::test]
    async fn execute_fails_when_credentials_are_invalid() {
        let repo = Arc::new(InMemoryRepo::default());
        let remote = Arc::new(RemoteClientStub {
            outcome: Ok(RemoteLoginOutcome::InvalidCredentials),
        });

        let use_case = LoginUseCase::new(repo, remote);
        let mut cmd = command();
        cmd.provincia = "99".to_string();

        let err = use_case.execute(cmd).await.unwrap_err();

        assert!(matches!(err, LoginUseCaseError::InvalidInput(_)));
    }

    #[tokio::test]
    async fn execute_fails_when_remote_rejects_credentials() {
        let repo = Arc::new(InMemoryRepo::default());
        let remote = Arc::new(RemoteClientStub {
            outcome: Ok(RemoteLoginOutcome::InvalidCredentials),
        });

        let use_case = LoginUseCase::new(repo, remote);
        let err = use_case.execute(command()).await.unwrap_err();

        assert_eq!(err, LoginUseCaseError::InvalidCredentials);
    }
}

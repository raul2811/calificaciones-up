#![allow(dead_code)]

use async_trait::async_trait;

use crate::domain::{credentials::RemoteLoginCredentials, session::InternalSession};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteLoginCookies {
    pub cookiesession1: Option<String>,
    pub jsessionid: Option<String>,
    pub sevup_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemoteLoginOutcome {
    Authenticated(RemoteLoginCookies),
    InvalidCredentials,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteLoginClientError;

#[async_trait]
pub trait RemoteLoginClient: Send + Sync {
    async fn login_remote(
        &self,
        credentials: &RemoteLoginCredentials,
    ) -> Result<RemoteLoginOutcome, RemoteLoginClientError>;

    async fn fetch_avance_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError>;

    async fn fetch_notas_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError>;

    async fn fetch_profesores_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError>;

    async fn fetch_morosidad_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError>;

    async fn fetch_student_photo(
        &self,
        session: &InternalSession,
    ) -> Result<RemotePhotoPayload, RemotePhotoFetchError>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemoteFetchError {
    SessionExpired,
    Upstream,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemotePhotoPayload {
    pub content_type: Option<String>,
    pub bytes: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemotePhotoFetchError {
    SessionExpired,
    NotFound,
    Upstream,
}

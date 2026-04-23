#![allow(dead_code)]
use async_trait::async_trait;
use time::OffsetDateTime;

use crate::domain::session::{InternalSession, SessionId};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionRepositoryError;

#[async_trait]
pub trait SessionRepository: Send + Sync {
    async fn save(&self, session: InternalSession) -> Result<(), SessionRepositoryError>;

    async fn find_by_session_id(
        &self,
        session_id: &SessionId,
    ) -> Result<Option<InternalSession>, SessionRepositoryError>;

    async fn touch_last_used(
        &self,
        session_id: &SessionId,
        at: OffsetDateTime,
    ) -> Result<(), SessionRepositoryError>;

    async fn delete(&self, session_id: &SessionId) -> Result<(), SessionRepositoryError>;

    async fn remove_expired(&self, now: OffsetDateTime) -> Result<usize, SessionRepositoryError>;
}

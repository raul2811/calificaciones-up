#![allow(dead_code)]
use std::{collections::HashMap, sync::Arc};

use async_trait::async_trait;
use time::OffsetDateTime;
use tokio::sync::RwLock;

use crate::{
    application::session_repository::{SessionRepository, SessionRepositoryError},
    domain::session::{InternalSession, SessionId},
};

#[derive(Clone, Default)]
pub struct InMemorySessionRepository {
    sessions: Arc<RwLock<HashMap<String, InternalSession>>>,
}

impl InMemorySessionRepository {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl SessionRepository for InMemorySessionRepository {
    async fn save(&self, session: InternalSession) -> Result<(), SessionRepositoryError> {
        let key = session.session_id.as_str().to_string();
        self.sessions.write().await.insert(key, session);
        Ok(())
    }

    async fn find_by_session_id(
        &self,
        session_id: &SessionId,
    ) -> Result<Option<InternalSession>, SessionRepositoryError> {
        let maybe_session = self.sessions.read().await.get(session_id.as_str()).cloned();

        Ok(maybe_session)
    }

    async fn touch_last_used(
        &self,
        session_id: &SessionId,
        at: OffsetDateTime,
    ) -> Result<(), SessionRepositoryError> {
        if let Some(session) = self.sessions.write().await.get_mut(session_id.as_str()) {
            session.touch(at);
        }

        Ok(())
    }

    async fn delete(&self, session_id: &SessionId) -> Result<(), SessionRepositoryError> {
        self.sessions.write().await.remove(session_id.as_str());
        Ok(())
    }

    async fn remove_expired(&self, now: OffsetDateTime) -> Result<usize, SessionRepositoryError> {
        let mut sessions = self.sessions.write().await;
        let before = sessions.len();
        sessions.retain(|_, session| !session.is_expired(now));
        Ok(before - sessions.len())
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use time::Duration;

    use super::*;

    #[tokio::test]
    async fn save_and_find_session() {
        let repo = InMemorySessionRepository::new();
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_authenticated(true);
        let session_id = session.session_id.clone();

        repo.save(session.clone()).await.unwrap();
        let loaded = repo.find_by_session_id(&session_id).await.unwrap().unwrap();

        assert_eq!(loaded, session);
    }

    #[tokio::test]
    async fn touch_updates_last_used_at() {
        let repo = InMemorySessionRepository::new();
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now);
        let session_id = session.session_id.clone();
        repo.save(session).await.unwrap();

        let touched_at = now + Duration::minutes(5);
        repo.touch_last_used(&session_id, touched_at).await.unwrap();

        let loaded = repo.find_by_session_id(&session_id).await.unwrap().unwrap();
        assert_eq!(loaded.last_used_at, touched_at);
    }

    #[tokio::test]
    async fn delete_removes_session() {
        let repo = InMemorySessionRepository::new();
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now);
        let session_id = session.session_id.clone();
        repo.save(session).await.unwrap();

        repo.delete(&session_id).await.unwrap();

        let loaded = repo.find_by_session_id(&session_id).await.unwrap();
        assert!(loaded.is_none());
    }

    #[tokio::test]
    async fn remove_expired_only_removes_expired_sessions() {
        let repo = Arc::new(InMemorySessionRepository::new());
        let now = OffsetDateTime::now_utc();

        let expired = InternalSession::new(SessionId::generate(), now)
            .with_expires_at(Some(now - Duration::minutes(1)));
        let active = InternalSession::new(SessionId::generate(), now)
            .with_expires_at(Some(now + Duration::minutes(30)));

        let expired_id = expired.session_id.clone();
        let active_id = active.session_id.clone();

        repo.save(expired).await.unwrap();
        repo.save(active).await.unwrap();

        let removed = repo.remove_expired(now).await.unwrap();
        assert_eq!(removed, 1);

        assert!(repo
            .find_by_session_id(&expired_id)
            .await
            .unwrap()
            .is_none());
        assert!(repo.find_by_session_id(&active_id).await.unwrap().is_some());
    }
}

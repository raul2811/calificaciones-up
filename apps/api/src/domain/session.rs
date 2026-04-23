#![allow(dead_code)]
use std::fmt::{Display, Formatter};

use serde::Serialize;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SessionId(String);

impl SessionId {
    pub fn generate() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn try_new(value: String) -> Result<Self, SessionValidationError> {
        if value.trim().is_empty() {
            return Err(SessionValidationError::InvalidSessionId);
        }

        Ok(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Display for SessionId {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InternalSession {
    pub session_id: SessionId,
    pub cookiesession1: Option<String>,
    pub jsessionid: Option<String>,
    pub sevup_id: Option<String>,
    pub authenticated: bool,
    pub created_at: OffsetDateTime,
    pub last_used_at: OffsetDateTime,
    pub expires_at: Option<OffsetDateTime>,
}

impl InternalSession {
    pub fn new(session_id: SessionId, now: OffsetDateTime) -> Self {
        Self {
            session_id,
            cookiesession1: None,
            jsessionid: None,
            sevup_id: None,
            authenticated: false,
            created_at: now,
            last_used_at: now,
            expires_at: None,
        }
    }

    pub fn with_remote_cookies(
        mut self,
        cookiesession1: Option<String>,
        jsessionid: Option<String>,
        sevup_id: Option<String>,
    ) -> Self {
        self.cookiesession1 = cookiesession1;
        self.jsessionid = jsessionid;
        self.sevup_id = sevup_id;
        self
    }

    pub fn with_authenticated(mut self, authenticated: bool) -> Self {
        self.authenticated = authenticated;
        self
    }

    pub fn with_expires_at(mut self, expires_at: Option<OffsetDateTime>) -> Self {
        self.expires_at = expires_at;
        self
    }

    pub fn touch(&mut self, now: OffsetDateTime) {
        self.last_used_at = now;
    }

    pub fn is_expired(&self, now: OffsetDateTime) -> bool {
        self.expires_at.is_some_and(|expires_at| now >= expires_at)
    }

    pub fn to_frontend_view(&self) -> FrontendSession {
        FrontendSession {
            session_id: self.session_id.as_str().to_string(),
            authenticated: self.authenticated,
            created_at: self.created_at,
            last_used_at: self.last_used_at,
            expires_at: self.expires_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct FrontendSession {
    pub session_id: String,
    pub authenticated: bool,
    pub created_at: OffsetDateTime,
    pub last_used_at: OffsetDateTime,
    pub expires_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SessionValidationError {
    InvalidSessionId,
}

impl Display for SessionValidationError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidSessionId => f.write_str("Invalid session id."),
        }
    }
}

impl std::error::Error for SessionValidationError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn session_id_rejects_blank_values() {
        assert_eq!(
            SessionId::try_new(" ".to_string()).unwrap_err(),
            SessionValidationError::InvalidSessionId
        );
    }

    #[test]
    fn frontend_view_does_not_expose_remote_cookie_fields() {
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_remote_cookies(
            Some("cookie-session-1".to_string()),
            Some("j-session-id".to_string()),
            Some("sevup-id".to_string()),
        );

        let serialized = serde_json::to_string(&session.to_frontend_view()).expect("serializable");

        assert!(!serialized.contains("cookiesession1"));
        assert!(!serialized.contains("jsessionid"));
        assert!(!serialized.contains("sevup_id"));
    }
}

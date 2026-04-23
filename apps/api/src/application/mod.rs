pub mod academic_progress_parser;
pub mod academic_record_consolidator;
pub mod health_service;
pub mod login_use_case;
pub mod morosidad_parser;
pub mod notes_credits_parser;
pub mod professors_parser;
pub mod remote_login_client;
pub mod session_repository;
pub mod student_avance_use_case;
pub mod student_photo_use_case;

use std::sync::Arc;

use remote_login_client::RemoteLoginClient;
use session_repository::SessionRepository;

#[derive(Clone)]
pub struct AppState {
    pub session_repository: Arc<dyn SessionRepository>,
    pub remote_login_client: Arc<dyn RemoteLoginClient>,
}

impl AppState {
    pub fn new(
        session_repository: Arc<dyn SessionRepository>,
        remote_login_client: Arc<dyn RemoteLoginClient>,
    ) -> Self {
        Self {
            session_repository,
            remote_login_client,
        }
    }
}

use std::sync::Arc;

use crate::{
    application::{
        academic_progress_parser::AcademicProgressParser, health_service::HealthService,
        morosidad_parser::MorosidadParser, notes_credits_parser::NotesCreditsParser,
        professors_parser::ProfessorsParser, AppState,
    },
    infrastructure::config::Config,
};

#[derive(Clone)]
pub struct ApiState {
    pub config: Arc<Config>,
    pub app_state: Arc<AppState>,
    pub academic_progress_parser: Arc<dyn AcademicProgressParser>,
    pub notes_credits_parser: Arc<dyn NotesCreditsParser>,
    pub professors_parser: Arc<dyn ProfessorsParser>,
    pub morosidad_parser: Arc<dyn MorosidadParser>,
    pub health_service: HealthService,
}

impl ApiState {
    pub fn new(
        config: Arc<Config>,
        app_state: Arc<AppState>,
        academic_progress_parser: Arc<dyn AcademicProgressParser>,
        notes_credits_parser: Arc<dyn NotesCreditsParser>,
        professors_parser: Arc<dyn ProfessorsParser>,
        morosidad_parser: Arc<dyn MorosidadParser>,
    ) -> Self {
        Self {
            config,
            app_state,
            academic_progress_parser,
            notes_credits_parser,
            professors_parser,
            morosidad_parser,
            health_service: HealthService,
        }
    }
}

use std::sync::Arc;

use axum::{
    http::{header, HeaderValue, Method},
    routing::{get, post},
    Router,
};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{application::AppState, infrastructure::config::Config};
use crate::application::academic_progress_parser::AcademicProgressParser;
use crate::application::morosidad_parser::MorosidadParser;
use crate::application::notes_credits_parser::NotesCreditsParser;
use crate::application::professors_parser::ProfessorsParser;

use super::{handlers, state::ApiState};

pub fn build_router(
    config: Arc<Config>,
    app_state: Arc<AppState>,
    academic_progress_parser: Arc<dyn AcademicProgressParser>,
    notes_credits_parser: Arc<dyn NotesCreditsParser>,
    professors_parser: Arc<dyn ProfessorsParser>,
    morosidad_parser: Arc<dyn MorosidadParser>,
) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_origin
                .parse::<HeaderValue>()
                .expect("invalid FRONTEND_ORIGIN"),
        )
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE])
        .allow_credentials(true);

    let state = ApiState::new(
        config,
        app_state,
        academic_progress_parser,
        notes_credits_parser,
        professors_parser,
        morosidad_parser,
    );

    Router::new()
        .route("/health", get(handlers::health))
        .route("/ready", get(handlers::ready))
        .route("/auth/login", post(handlers::auth_login))
        .route("/auth/session", get(handlers::auth_session))
        .route("/auth/logout", post(handlers::auth_logout))
        .route("/student/avance", get(handlers::student_avance))
        .route("/student/photo", get(handlers::student_photo))
        .with_state(state)
        .layer(TraceLayer::new_for_http())
        .layer(cors)
}

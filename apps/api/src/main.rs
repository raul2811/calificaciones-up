mod api;
mod application;
mod domain;
mod infrastructure;

use std::sync::Arc;

use application::AppState;
use dotenvy::dotenv;
use infrastructure::{
    avance_parser::ScraperAcademicProgressParser,
    config::Config,
    matricula_client::MatriculaUpClient,
    morosidad_parser::ScraperMorosidadParser,
    notas_parser::ScraperNotesCreditsParser,
    observability::init_tracing,
    profesores_parser::ScraperProfessorsParser,
    session_repository_in_memory::InMemorySessionRepository,
};
use tracing::info;

#[tokio::main]
async fn main() {
    let _ = dotenv();

    let config = Arc::new(Config::from_env());
    init_tracing(&config.log_level);

    let remote_login_client = Arc::new(
        MatriculaUpClient::new(&config.matricula_base_url, &config.matricula_user_agent)
            .expect("invalid Matricula client configuration"),
    );
    let session_repository = Arc::new(InMemorySessionRepository::new());
    let app_state = Arc::new(AppState::new(session_repository, remote_login_client));
    let academic_progress_parser = Arc::new(ScraperAcademicProgressParser);
    let notes_credits_parser = Arc::new(ScraperNotesCreditsParser);
    let professors_parser = Arc::new(ScraperProfessorsParser);
    let morosidad_parser = Arc::new(ScraperMorosidadParser);

    let app = api::router::build_router(
        Arc::clone(&config),
        Arc::clone(&app_state),
        academic_progress_parser,
        notes_credits_parser,
        professors_parser,
        morosidad_parser,
    );

    info!(addr = %config.api_addr, "starting backend server");

    let listener = tokio::net::TcpListener::bind(config.api_addr)
        .await
        .expect("failed to bind API socket");

    axum::serve(listener, app)
        .await
        .expect("failed to run API server");
}

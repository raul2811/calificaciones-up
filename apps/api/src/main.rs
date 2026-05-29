mod api;
mod application;
mod domain;
mod infrastructure;

use std::sync::Arc;

use application::session_repository::SessionRepository;
use application::AppState;
use dotenvy::dotenv;
use infrastructure::{
    avance_parser::ScraperAcademicProgressParser, config::Config,
    matricula_client::MatriculaUpClient, metrics, morosidad_parser::ScraperMorosidadParser,
    notas_parser::ScraperNotesCreditsParser, observability::init_tracing,
    profesores_parser::ScraperProfessorsParser,
    session_repository_in_memory::InMemorySessionRepository,
};
use tracing::{info, warn};

#[tokio::main]
async fn main() {
    let _ = dotenv();

    let config = match Config::from_env() {
        Ok(config) => Arc::new(config),
        Err(error) => {
            eprintln!("{}", error);
            std::process::exit(1);
        }
    };
    init_tracing(&config.log_level);

    let remote_login_client = Arc::new(
        MatriculaUpClient::new(&config.matricula_base_url, &config.matricula_user_agent)
            .expect("invalid Matricula client configuration"),
    );
    let session_repository = Arc::new(InMemorySessionRepository::new());
    spawn_session_cleanup(Arc::clone(&session_repository));
    let app_state = Arc::new(AppState::new(session_repository, remote_login_client));
    let academic_progress_parser = Arc::new(ScraperAcademicProgressParser);
    let notes_credits_parser = Arc::new(ScraperNotesCreditsParser);
    let professors_parser = Arc::new(ScraperProfessorsParser);
    let morosidad_parser = Arc::new(ScraperMorosidadParser);
    metrics::set_active_sessions(0);

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
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("failed to run API server");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(error) = tokio::signal::ctrl_c().await {
            warn!(%error, "failed to install Ctrl+C handler");
            std::future::pending::<()>().await;
        }
    };

    #[cfg(unix)]
    {
        let terminate = async {
            match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
                Ok(mut signal) => {
                    signal.recv().await;
                }
                Err(error) => {
                    warn!(%error, "failed to install SIGTERM handler");
                    std::future::pending::<()>().await;
                }
            }
        };

        tokio::select! {
            _ = ctrl_c => {},
            _ = terminate => {},
        }
    }

    #[cfg(not(unix))]
    ctrl_c.await;

    info!("shutdown signal received");
}

fn spawn_session_cleanup(session_repository: Arc<InMemorySessionRepository>) {
    tokio::spawn(async move {
        let mut ticker = tokio::time::interval(std::time::Duration::from_secs(60));
        loop {
            ticker.tick().await;
            let now = time::OffsetDateTime::now_utc();
            if session_repository.remove_expired(now).await.is_ok() {
                if let Ok(count) = session_repository.count().await {
                    metrics::set_active_sessions(count);
                }
            }
        }
    });
}

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn init_tracing(log_level: &str) {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(log_level.to_string()))
        .with(tracing_subscriber::fmt::layer().with_target(false))
        .init();
}

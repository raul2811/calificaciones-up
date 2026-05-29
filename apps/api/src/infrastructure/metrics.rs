use std::time::Duration;

use axum::{
    body::Body,
    http::{HeaderValue, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use lazy_static::lazy_static;
use prometheus::{
    register_histogram_vec, register_int_counter_vec, register_int_gauge, Encoder, HistogramVec,
    IntCounterVec, IntGauge, TextEncoder,
};

lazy_static! {
    static ref HTTP_REQUESTS_TOTAL: IntCounterVec = register_int_counter_vec!(
        "calificaciones_up_http_requests_total",
        "Total HTTP requests handled by calificaciones-up",
        &["method", "route", "status_class"]
    )
    .expect("register http requests counter");
    static ref HTTP_REQUEST_DURATION_SECONDS: HistogramVec = register_histogram_vec!(
        "calificaciones_up_http_request_duration_seconds",
        "HTTP request duration in calificaciones-up",
        &["method", "route", "status_class"],
        vec![0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0]
    )
    .expect("register http duration histogram");
    static ref REMOTE_LOGIN_TOTAL: IntCounterVec = register_int_counter_vec!(
        "calificaciones_up_remote_login_total",
        "Remote login attempts against Matricula UP",
        &["outcome"]
    )
    .expect("register remote login counter");
    static ref REMOTE_LOGIN_DURATION_SECONDS: HistogramVec = register_histogram_vec!(
        "calificaciones_up_remote_login_duration_seconds",
        "Duration of the remote login request to Matricula UP",
        &["outcome"],
        vec![0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 20.0, 40.0, 60.0]
    )
    .expect("register remote login histogram");
    static ref LOGIN_ATTEMPTS_TOTAL: IntCounterVec = register_int_counter_vec!(
        "calificaciones_up_login_attempts_total",
        "Total login attempts handled by calificaciones-up",
        &["outcome"]
    )
    .expect("register login attempts counter");
    static ref ACTIVE_SESSIONS: IntGauge = register_int_gauge!(
        "calificaciones_up_active_sessions",
        "Current number of active internal sessions"
    )
    .expect("register active sessions gauge");
}

pub async fn record_http_metrics(req: Request<Body>, next: Next) -> Response {
    let method = req.method().as_str().to_string();
    let route = req.uri().path().to_string();
    let started_at = std::time::Instant::now();

    let response = next.run(req).await;
    let status_class = status_class(response.status());
    let elapsed = started_at.elapsed().as_secs_f64();

    HTTP_REQUESTS_TOTAL
        .with_label_values(&[method.as_str(), route.as_str(), status_class])
        .inc();
    HTTP_REQUEST_DURATION_SECONDS
        .with_label_values(&[method.as_str(), route.as_str(), status_class])
        .observe(elapsed);

    response
}

pub fn record_remote_login_attempt(outcome: &str, duration: Duration) {
    REMOTE_LOGIN_TOTAL.with_label_values(&[outcome]).inc();
    REMOTE_LOGIN_DURATION_SECONDS
        .with_label_values(&[outcome])
        .observe(duration.as_secs_f64());
}

pub fn record_login_attempt(outcome: &str) {
    LOGIN_ATTEMPTS_TOTAL.with_label_values(&[outcome]).inc();
}

pub fn set_active_sessions(count: usize) {
    ACTIVE_SESSIONS.set(count as i64);
}

pub fn render_metrics() -> Result<String, String> {
    let metric_families = prometheus::gather();
    let encoder = TextEncoder::new();
    let mut buffer = Vec::new();

    encoder
        .encode(&metric_families, &mut buffer)
        .map_err(|error| error.to_string())?;

    String::from_utf8(buffer).map_err(|error| error.to_string())
}

fn status_class(status: StatusCode) -> &'static str {
    match status.as_u16() {
        100..=199 => "1xx",
        200..=299 => "2xx",
        300..=399 => "3xx",
        400..=499 => "4xx",
        _ => "5xx",
    }
}

pub fn metrics_content_type() -> HeaderValue {
    HeaderValue::from_static("text/plain; version=0.0.4; charset=utf-8")
}

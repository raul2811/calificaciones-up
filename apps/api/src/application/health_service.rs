use crate::domain::health::{HealthResponse, ReadyResponse};

#[derive(Clone, Default)]
pub struct HealthService;

impl HealthService {
    pub fn get_health(&self) -> HealthResponse {
        HealthResponse {
            status: "ok",
            service: "calificaciones-up-api",
        }
    }

    pub fn get_readiness(&self) -> ReadyResponse {
        ReadyResponse {
            status: "ok",
            ready: true,
        }
    }
}

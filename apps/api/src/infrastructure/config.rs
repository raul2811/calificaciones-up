use std::net::SocketAddr;
use std::{
    error::Error,
    fmt::{Display, Formatter},
};

use axum::http::HeaderValue;

#[derive(Clone, Debug)]
pub struct Config {
    pub api_addr: SocketAddr,
    pub frontend_origin: String,
    pub log_level: String,
    pub matricula_base_url: String,
    pub matricula_user_agent: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConfigError {
    message: String,
}

impl ConfigError {
    fn missing(name: &str) -> Self {
        Self {
            message: format!("Missing required environment variable: {}", name),
        }
    }

    fn invalid(name: &str) -> Self {
        Self {
            message: format!("Invalid environment variable: {}", name),
        }
    }
}

impl Display for ConfigError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}

impl Error for ConfigError {}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let api_addr = match std::env::var("API_ADDR") {
            Ok(raw) => raw
                .parse::<SocketAddr>()
                .map_err(|_| ConfigError::invalid("API_ADDR"))?,
            Err(_) => {
                let port = std::env::var("PORT")
                    .ok()
                    .and_then(|raw| raw.parse::<u16>().ok())
                    .unwrap_or(8081);

                SocketAddr::from(([0, 0, 0, 0], port))
            }
        };

        let frontend_origin = std::env::var("FRONTEND_ORIGIN")
            .map_err(|_| ConfigError::missing("FRONTEND_ORIGIN"))?;
        HeaderValue::from_str(&frontend_origin)
            .map_err(|_| ConfigError::invalid("FRONTEND_ORIGIN"))?;

        let log_level =
            std::env::var("RUST_LOG").unwrap_or_else(|_| "api=info,tower_http=info".to_string());

        let matricula_base_url = std::env::var("MATRICULA_BASE_URL")
            .map_err(|_| ConfigError::missing("MATRICULA_BASE_URL"))?;
        reqwest::Url::parse(&matricula_base_url)
            .map_err(|_| ConfigError::invalid("MATRICULA_BASE_URL"))?;

        let matricula_user_agent = std::env::var("MATRICULA_USER_AGENT").unwrap_or_else(|_| {
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                .to_string()
        });

        Ok(Self {
            api_addr,
            frontend_origin,
            log_level,
            matricula_base_url,
            matricula_user_agent,
        })
    }
}

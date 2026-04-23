use std::net::SocketAddr;

#[derive(Clone, Debug)]
pub struct Config {
    pub api_addr: SocketAddr,
    pub frontend_origin: String,
    pub log_level: String,
    pub matricula_base_url: String,
    pub matricula_user_agent: String,
}

impl Config {
    pub fn from_env() -> Self {
        let api_addr = std::env::var("API_ADDR")
            .ok()
            .and_then(|raw| raw.parse::<SocketAddr>().ok())
            .unwrap_or_else(|| {
                "0.0.0.0:8081"
                    .parse::<SocketAddr>()
                    .expect("default API_ADDR must be valid")
            });

        let frontend_origin =
            std::env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_string());

        let log_level = std::env::var("RUST_LOG").unwrap_or_else(|_| "api=info,tower_http=info".to_string());

        let matricula_base_url =
            std::env::var("MATRICULA_BASE_URL").unwrap_or_else(|_| "https://matricula.up.ac.pa".to_string());

        let matricula_user_agent = std::env::var("MATRICULA_USER_AGENT").unwrap_or_else(|_| {
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                .to_string()
        });

        Self {
            api_addr,
            frontend_origin,
            log_level,
            matricula_base_url,
            matricula_user_agent,
        }
    }
}

#![allow(dead_code)]

use std::fmt::{Display, Formatter};

use reqwest::{
    header::{HeaderMap, ACCEPT, CONTENT_TYPE, LOCATION, ORIGIN, REFERER, SET_COOKIE, USER_AGENT},
    redirect::Policy,
    StatusCode, Url,
};

use crate::application::remote_login_client::{
    RemoteFetchError, RemoteLoginClient, RemoteLoginClientError, RemoteLoginCookies,
    RemoteLoginOutcome, RemotePhotoFetchError, RemotePhotoPayload,
};
use crate::domain::{credentials::RemoteLoginCredentials, session::InternalSession};
use async_trait::async_trait;

const LOGIN_PATH: &str = "/sevup/acceso/index.html";
const AVANCE_PATH: &str = "/sevup/informe/avanceAcademico.html";
const NOTAS_PATH: &str = "/sevup/informe/notas.html";
const PROFESORES_PATH: &str = "/sevup/informe/cargarProfesor.html";
const MOROSIDAD_PATH: &str = "/sevup/informe/morosidad.html";
const PHOTO_PATH: &str = "/sevup/usuario/muestraImagenUsuarioByByte.html";
const LOGIN_SUCCESS_LOCATION: &str = "../usuario/inicio.html";
const LOGIN_ORIGIN: &str = "https://matricula.up.ac.pa";
const LOGIN_REFERER: &str = "https://matricula.up.ac.pa/sevup/";
const AVANCE_REFERER: &str = "https://matricula.up.ac.pa/sevup/usuario/inicio.html";
const NOTAS_REFERER: &str = "https://matricula.up.ac.pa/sevup/usuario/inicio.html";
const PROFESORES_REFERER: &str = "https://matricula.up.ac.pa/sevup/usuario/inicio.html";
const MOROSIDAD_REFERER: &str = "https://matricula.up.ac.pa/sevup/usuario/inicio.html";
const PHOTO_REFERER: &str = "https://matricula.up.ac.pa/sevup/usuario/inicio.html";
const REMOTE_LOGIN_LOCATION_HINT: &str = "/sevup/acceso/";
const ACCEPT_HEADER: &str = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteSessionCookies {
    pub cookiesession1: Option<String>,
    pub jsessionid: Option<String>,
    pub sevup_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RemoteLoginResult {
    Authenticated(RemoteSessionCookies),
    InvalidCredentials,
    UnexpectedResponse {
        status_code: u16,
        location: Option<String>,
    },
}

#[derive(Debug)]
pub enum MatriculaClientError {
    InvalidBaseUrl,
    RequestFailed(reqwest::Error),
    MissingRemoteCookies,
    RemoteSessionExpired,
    UnexpectedResponse { status_code: u16 },
}

impl Display for MatriculaClientError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidBaseUrl => f.write_str("Invalid MATRICULA_BASE_URL."),
            Self::RequestFailed(_) => f.write_str("Remote request to Matricula UP failed."),
            Self::MissingRemoteCookies => {
                f.write_str("Missing remote cookies in internal session.")
            }
            Self::RemoteSessionExpired => f.write_str("Remote session expired."),
            Self::UnexpectedResponse { status_code } => {
                write!(f, "Unexpected response from Matricula UP: {}", status_code)
            }
        }
    }
}

impl std::error::Error for MatriculaClientError {}

#[derive(Clone)]
pub struct MatriculaUpClient {
    http: reqwest::Client,
    base_url: Url,
    user_agent: String,
}

impl MatriculaUpClient {
    pub fn new(base_url: &str, user_agent: &str) -> Result<Self, MatriculaClientError> {
        let parsed_base = Url::parse(base_url).map_err(|_| MatriculaClientError::InvalidBaseUrl)?;

        let http = reqwest::Client::builder()
            .redirect(Policy::none())
            .build()
            .map_err(MatriculaClientError::RequestFailed)?;

        Ok(Self {
            http,
            base_url: parsed_base,
            user_agent: user_agent.to_string(),
        })
    }

    pub async fn login(
        &self,
        credentials: &RemoteLoginCredentials,
    ) -> Result<RemoteLoginResult, MatriculaClientError> {
        let login_url = self
            .base_url
            .join(LOGIN_PATH)
            .map_err(|_| MatriculaClientError::InvalidBaseUrl)?;

        let response = self
            .http
            .post(login_url)
            .header(USER_AGENT, self.user_agent.as_str())
            .header(ACCEPT, ACCEPT_HEADER)
            .header(ORIGIN, LOGIN_ORIGIN)
            .header(REFERER, LOGIN_REFERER)
            .header(CONTENT_TYPE, "application/x-www-form-urlencoded")
            .form(&[
                ("provincia", credentials.provincia.as_str()),
                ("clase", credentials.clase.as_str()),
                ("tomo", credentials.tomo.as_str()),
                ("folio", credentials.folio.as_str()),
                ("password", credentials.password.expose_secret()),
            ])
            .send()
            .await
            .map_err(MatriculaClientError::RequestFailed)?;

        let location = response
            .headers()
            .get(LOCATION)
            .and_then(|value| value.to_str().ok())
            .map(str::to_string);

        if is_login_success(response.status(), location.as_deref()) {
            let cookies = extract_remote_cookies(response.headers());
            return Ok(RemoteLoginResult::Authenticated(cookies));
        }

        if response.status() == StatusCode::OK {
            return Ok(RemoteLoginResult::InvalidCredentials);
        }

        Ok(RemoteLoginResult::UnexpectedResponse {
            status_code: response.status().as_u16(),
            location,
        })
    }

    pub async fn fetch_avance_academico_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, MatriculaClientError> {
        self.fetch_authenticated_html(AVANCE_PATH, AVANCE_REFERER, session)
            .await
    }

    pub async fn fetch_notas_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, MatriculaClientError> {
        self.fetch_authenticated_html(NOTAS_PATH, NOTAS_REFERER, session)
            .await
    }

    pub async fn fetch_profesores_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, MatriculaClientError> {
        self.fetch_authenticated_html(PROFESORES_PATH, PROFESORES_REFERER, session)
            .await
    }

    pub async fn fetch_morosidad_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, MatriculaClientError> {
        self.fetch_authenticated_html(MOROSIDAD_PATH, MOROSIDAD_REFERER, session)
            .await
    }

    pub async fn fetch_student_photo(
        &self,
        session: &InternalSession,
    ) -> Result<RemotePhotoPayload, MatriculaClientError> {
        let cookie_header = build_remote_cookie_header(session)
            .ok_or(MatriculaClientError::MissingRemoteCookies)?;

        let url = self
            .base_url
            .join(PHOTO_PATH)
            .map_err(|_| MatriculaClientError::InvalidBaseUrl)?;

        let response = self
            .http
            .get(url)
            .header(USER_AGENT, self.user_agent.as_str())
            .header(REFERER, PHOTO_REFERER)
            .header(ACCEPT, ACCEPT_HEADER)
            .header(reqwest::header::COOKIE, cookie_header)
            .send()
            .await
            .map_err(MatriculaClientError::RequestFailed)?;

        if response.status() == StatusCode::FOUND {
            let location = response
                .headers()
                .get(LOCATION)
                .and_then(|value| value.to_str().ok())
                .unwrap_or_default();

            if location.contains(REMOTE_LOGIN_LOCATION_HINT)
                || location.contains("acceso/index.html")
            {
                return Err(MatriculaClientError::RemoteSessionExpired);
            }
        }

        if response.status() == StatusCode::UNAUTHORIZED {
            return Err(MatriculaClientError::RemoteSessionExpired);
        }

        if response.status() == StatusCode::NOT_FOUND {
            return Err(MatriculaClientError::UnexpectedResponse { status_code: 404 });
        }

        if !response.status().is_success() {
            return Err(MatriculaClientError::UnexpectedResponse {
                status_code: response.status().as_u16(),
            });
        }

        let content_type = response
            .headers()
            .get(CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .map(|value| value.to_string());

        let bytes = response
            .bytes()
            .await
            .map_err(MatriculaClientError::RequestFailed)?
            .to_vec();

        Ok(RemotePhotoPayload {
            content_type,
            bytes,
        })
    }

    async fn fetch_authenticated_html(
        &self,
        path: &str,
        referer: &str,
        session: &InternalSession,
    ) -> Result<String, MatriculaClientError> {
        let cookie_header = build_remote_cookie_header(session)
            .ok_or(MatriculaClientError::MissingRemoteCookies)?;

        let url = self
            .base_url
            .join(path)
            .map_err(|_| MatriculaClientError::InvalidBaseUrl)?;

        let response = self
            .http
            .get(url)
            .header(USER_AGENT, self.user_agent.as_str())
            .header(REFERER, referer)
            .header(ACCEPT, ACCEPT_HEADER)
            .header(reqwest::header::COOKIE, cookie_header)
            .send()
            .await
            .map_err(MatriculaClientError::RequestFailed)?;

        if response.status() == StatusCode::FOUND {
            let location = response
                .headers()
                .get(LOCATION)
                .and_then(|value| value.to_str().ok())
                .unwrap_or_default();

            if location.contains(REMOTE_LOGIN_LOCATION_HINT)
                || location.contains("acceso/index.html")
            {
                return Err(MatriculaClientError::RemoteSessionExpired);
            }
        }

        if response.status() == StatusCode::UNAUTHORIZED {
            return Err(MatriculaClientError::RemoteSessionExpired);
        }

        if !response.status().is_success() {
            return Err(MatriculaClientError::UnexpectedResponse {
                status_code: response.status().as_u16(),
            });
        }

        response
            .text()
            .await
            .map_err(MatriculaClientError::RequestFailed)
    }
}

#[async_trait]
impl RemoteLoginClient for MatriculaUpClient {
    async fn login_remote(
        &self,
        credentials: &RemoteLoginCredentials,
    ) -> Result<RemoteLoginOutcome, RemoteLoginClientError> {
        let result = MatriculaUpClient::login(self, credentials)
            .await
            .map_err(|_| RemoteLoginClientError)?;

        match result {
            RemoteLoginResult::Authenticated(cookies) => {
                Ok(RemoteLoginOutcome::Authenticated(RemoteLoginCookies {
                    cookiesession1: cookies.cookiesession1,
                    jsessionid: cookies.jsessionid,
                    sevup_id: cookies.sevup_id,
                }))
            }
            RemoteLoginResult::InvalidCredentials => Ok(RemoteLoginOutcome::InvalidCredentials),
            RemoteLoginResult::UnexpectedResponse { .. } => Err(RemoteLoginClientError),
        }
    }

    async fn fetch_avance_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError> {
        self.fetch_avance_academico_html(session)
            .await
            .map_err(|error| match error {
                MatriculaClientError::RemoteSessionExpired => RemoteFetchError::SessionExpired,
                _ => RemoteFetchError::Upstream,
            })
    }

    async fn fetch_notas_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError> {
        MatriculaUpClient::fetch_notas_html(self, session)
            .await
            .map_err(|error| match error {
                MatriculaClientError::RemoteSessionExpired => RemoteFetchError::SessionExpired,
                _ => RemoteFetchError::Upstream,
            })
    }

    async fn fetch_profesores_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError> {
        MatriculaUpClient::fetch_profesores_html(self, session)
            .await
            .map_err(|error| match error {
                MatriculaClientError::RemoteSessionExpired => RemoteFetchError::SessionExpired,
                _ => RemoteFetchError::Upstream,
            })
    }

    async fn fetch_morosidad_html(
        &self,
        session: &InternalSession,
    ) -> Result<String, RemoteFetchError> {
        MatriculaUpClient::fetch_morosidad_html(self, session)
            .await
            .map_err(|error| match error {
                MatriculaClientError::RemoteSessionExpired => RemoteFetchError::SessionExpired,
                _ => RemoteFetchError::Upstream,
            })
    }

    async fn fetch_student_photo(
        &self,
        session: &InternalSession,
    ) -> Result<RemotePhotoPayload, RemotePhotoFetchError> {
        MatriculaUpClient::fetch_student_photo(self, session)
            .await
            .map_err(|error| match error {
                MatriculaClientError::RemoteSessionExpired => RemotePhotoFetchError::SessionExpired,
                MatriculaClientError::UnexpectedResponse { status_code: 404 } => {
                    RemotePhotoFetchError::NotFound
                }
                _ => RemotePhotoFetchError::Upstream,
            })
    }
}

fn is_login_success(status: StatusCode, location: Option<&str>) -> bool {
    status == StatusCode::FOUND && location.is_some_and(|loc| loc.contains(LOGIN_SUCCESS_LOCATION))
}

fn extract_remote_cookies(headers: &HeaderMap) -> RemoteSessionCookies {
    let mut cookiesession1: Option<String> = None;
    let mut jsessionid: Option<String> = None;
    let mut sevup_id: Option<String> = None;

    for value in headers.get_all(SET_COOKIE) {
        let Ok(raw_set_cookie) = value.to_str() else {
            continue;
        };

        let Some((name, raw_value)) = raw_set_cookie
            .split(';')
            .next()
            .and_then(|pair| pair.split_once('='))
        else {
            continue;
        };

        let cookie_name = name.trim();
        let cookie_value = raw_value.trim();

        if cookie_name.eq_ignore_ascii_case("cookiesession1") {
            cookiesession1 = Some(cookie_value.to_string());
        } else if cookie_name.eq_ignore_ascii_case("JSESSIONID") {
            jsessionid = Some(cookie_value.to_string());
        } else if cookie_name.eq_ignore_ascii_case("sevup_id") {
            sevup_id = Some(cookie_value.to_string());
        }
    }

    RemoteSessionCookies {
        cookiesession1,
        jsessionid,
        sevup_id,
    }
}

fn build_remote_cookie_header(session: &InternalSession) -> Option<String> {
    let mut pairs: Vec<String> = Vec::new();

    if let Some(value) = &session.cookiesession1 {
        pairs.push(format!("cookiesession1={}", value));
    }

    if let Some(value) = &session.jsessionid {
        pairs.push(format!("JSESSIONID={}", value));
    }

    if let Some(value) = &session.sevup_id {
        pairs.push(format!("sevup_id={}", value));
    }

    if pairs.is_empty() {
        return None;
    }

    Some(pairs.join("; "))
}

#[cfg(test)]
mod tests {
    use super::*;
    use reqwest::header::HeaderValue;
    use time::OffsetDateTime;

    use crate::domain::session::SessionId;

    #[test]
    fn login_success_requires_302_and_inicio_location() {
        assert!(is_login_success(
            StatusCode::FOUND,
            Some("../usuario/inicio.html?foo=bar")
        ));
        assert!(!is_login_success(
            StatusCode::OK,
            Some("../usuario/inicio.html")
        ));
        assert!(!is_login_success(StatusCode::FOUND, Some("/other")));
    }

    #[test]
    fn extract_remote_cookies_reads_expected_cookie_names() {
        let mut headers = HeaderMap::new();
        headers.append(
            SET_COOKIE,
            HeaderValue::from_static("cookiesession1=abc123; Path=/; HttpOnly"),
        );
        headers.append(
            SET_COOKIE,
            HeaderValue::from_static("JSESSIONID=js-789; Path=/; Secure"),
        );
        headers.append(
            SET_COOKIE,
            HeaderValue::from_static("sevup_id=up-456; Path=/"),
        );

        let cookies = extract_remote_cookies(&headers);

        assert_eq!(cookies.cookiesession1.as_deref(), Some("abc123"));
        assert_eq!(cookies.jsessionid.as_deref(), Some("js-789"));
        assert_eq!(cookies.sevup_id.as_deref(), Some("up-456"));
    }

    #[test]
    fn build_remote_cookie_header_uses_internal_session_values() {
        let now = OffsetDateTime::now_utc();
        let session = InternalSession::new(SessionId::generate(), now).with_remote_cookies(
            Some("cookie-1".to_string()),
            Some("j-session".to_string()),
            Some("sevup-x".to_string()),
        );

        let header = build_remote_cookie_header(&session).expect("cookie header expected");
        assert!(header.contains("cookiesession1=cookie-1"));
        assert!(header.contains("JSESSIONID=j-session"));
        assert!(header.contains("sevup_id=sevup-x"));
    }
}

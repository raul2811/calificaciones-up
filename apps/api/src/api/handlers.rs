use axum::{
    extract::State,
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use time::OffsetDateTime;

use crate::{
    api::state::ApiState,
    application::{
        login_use_case::{LoginCommand, LoginUseCase, LoginUseCaseError},
        student_avance_use_case::{
            GetStudentAvanceCommand, GetStudentAvanceError, GetStudentAvanceUseCase,
        },
        student_photo_use_case::{
            GetStudentPhotoCommand, GetStudentPhotoError, GetStudentPhotoUseCase,
        },
    },
    domain::error::AppError,
    domain::session::SessionId,
};

const APP_SESSION_COOKIE_NAME: &str = "app_session";

#[derive(serde::Deserialize)]
pub struct AuthLoginRequest {
    pub provincia: String,
    pub clase: String,
    pub tomo: String,
    pub folio: String,
    pub password: String,
}

#[derive(serde::Serialize)]
pub struct AuthLoginResponse {
    pub session_id: String,
    pub authenticated: bool,
}

#[derive(serde::Serialize)]
pub struct AuthSessionResponse {
    pub authenticated: bool,
}

pub async fn health(
    State(state): State<ApiState>,
) -> Result<Json<crate::domain::health::HealthResponse>, AppError> {
    let _origin = &state.config.frontend_origin;
    let _session_repo = &state.app_state.session_repository;
    let _remote_client = &state.app_state.remote_login_client;
    Ok(Json(state.health_service.get_health()))
}

pub async fn ready(
    State(state): State<ApiState>,
) -> Result<Json<crate::domain::health::ReadyResponse>, AppError> {
    let readiness = state.health_service.get_readiness();
    if !readiness.ready {
        return Err(AppError::ServiceUnavailable(
            "Service not ready.".to_string(),
        ));
    }

    Ok(Json(readiness))
}

pub async fn auth_login(
    State(state): State<ApiState>,
    jar: CookieJar,
    Json(payload): Json<AuthLoginRequest>,
) -> Result<(CookieJar, Json<AuthLoginResponse>), AppError> {
    let use_case = LoginUseCase::new(
        state.app_state.session_repository.clone(),
        state.app_state.remote_login_client.clone(),
    );

    let command = LoginCommand {
        provincia: payload.provincia,
        clase: payload.clase,
        tomo: payload.tomo,
        folio: payload.folio,
        password: payload.password,
    };

    let result = use_case.execute(command).await.map_err(map_login_error)?;

    let cookie = Cookie::build((APP_SESSION_COOKIE_NAME, result.session_id.clone()))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .build();

    let jar = jar.add(cookie);

    Ok((
        jar,
        Json(AuthLoginResponse {
            session_id: result.session_id,
            authenticated: true,
        }),
    ))
}

pub async fn auth_session(
    State(state): State<ApiState>,
    jar: CookieJar,
) -> Result<Json<AuthSessionResponse>, AppError> {
    let session_id = extract_session_id(&jar)?;
    let parsed_id = SessionId::try_new(session_id)
        .map_err(|_| AppError::Unauthorized("No autenticado.".to_string()))?;

    let maybe_session = state
        .app_state
        .session_repository
        .find_by_session_id(&parsed_id)
        .await
        .map_err(|_| AppError::Internal("Failed to load session.".to_string()))?;

    let Some(session) = maybe_session else {
        return Err(AppError::Unauthorized("No autenticado.".to_string()));
    };

    let now = OffsetDateTime::now_utc();
    if session.is_expired(now) {
        state
            .app_state
            .session_repository
            .delete(&parsed_id)
            .await
            .map_err(|_| AppError::Internal("Failed to remove session.".to_string()))?;

        return Err(AppError::Unauthorized("No autenticado.".to_string()));
    }

    state
        .app_state
        .session_repository
        .touch_last_used(&parsed_id, now)
        .await
        .map_err(|_| AppError::Internal("Failed to update session.".to_string()))?;

    Ok(Json(AuthSessionResponse {
        authenticated: session.authenticated,
    }))
}

pub async fn auth_logout(
    State(state): State<ApiState>,
    jar: CookieJar,
) -> Result<(StatusCode, CookieJar), AppError> {
    let mut next_jar = jar;

    if let Some(cookie) = next_jar.get(APP_SESSION_COOKIE_NAME) {
        if let Ok(session_id) = SessionId::try_new(cookie.value().to_string()) {
            state
                .app_state
                .session_repository
                .delete(&session_id)
                .await
                .map_err(|_| AppError::Internal("Failed to invalidate session.".to_string()))?;
        }

        let mut removal_cookie = Cookie::from(APP_SESSION_COOKIE_NAME);
        removal_cookie.set_path("/");
        next_jar = next_jar.remove(removal_cookie);
    }

    Ok((StatusCode::NO_CONTENT, next_jar))
}

pub async fn student_avance(
    State(state): State<ApiState>,
    jar: CookieJar,
) -> Result<Json<crate::domain::academic_progress::AcademicProgress>, AppError> {
    let session_id = extract_session_id(&jar)?;
    let use_case = GetStudentAvanceUseCase::new(
        state.app_state.session_repository.clone(),
        state.app_state.remote_login_client.clone(),
        state.academic_progress_parser.clone(),
        state.notes_credits_parser.clone(),
        state.professors_parser.clone(),
        state.morosidad_parser.clone(),
    );

    let result = use_case
        .execute(GetStudentAvanceCommand { session_id })
        .await
        .map_err(map_get_avance_error)?;

    Ok(Json(result))
}

pub async fn student_photo(
    State(state): State<ApiState>,
    jar: CookieJar,
) -> Result<Response, AppError> {
    let session_id = extract_session_id(&jar)?;
    let use_case = GetStudentPhotoUseCase::new(
        state.app_state.session_repository.clone(),
        state.app_state.remote_login_client.clone(),
    );

    let photo = use_case
        .execute(GetStudentPhotoCommand { session_id })
        .await
        .map_err(map_get_photo_error)?;

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        content_type_header(photo.content_type.as_deref()),
    );
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("private, no-store, max-age=0"),
    );

    Ok((StatusCode::OK, headers, photo.bytes).into_response())
}

fn extract_session_id(jar: &CookieJar) -> Result<String, AppError> {
    jar.get(APP_SESSION_COOKIE_NAME)
        .map(|cookie| cookie.value().to_string())
        .ok_or_else(|| AppError::Unauthorized("No autenticado.".to_string()))
}

fn map_login_error(error: LoginUseCaseError) -> AppError {
    match error {
        LoginUseCaseError::InvalidInput(validation) => AppError::BadRequest(validation.to_string()),
        LoginUseCaseError::InvalidCredentials => {
            AppError::Unauthorized("Credenciales invalidas.".to_string())
        }
        LoginUseCaseError::RemoteClient(_) => {
            AppError::BadGateway("Error autenticando contra Matricula UP.".to_string())
        }
        LoginUseCaseError::SessionStore(_) => {
            AppError::Internal("No fue posible crear sesion interna.".to_string())
        }
    }
}

fn map_get_avance_error(error: GetStudentAvanceError) -> AppError {
    match error {
        GetStudentAvanceError::Unauthorized => {
            AppError::Unauthorized("No autenticado.".to_string())
        }
        GetStudentAvanceError::RemoteSessionExpired => {
            AppError::Unauthorized("Sesion remota expirada.".to_string())
        }
        GetStudentAvanceError::ParseFailed => AppError::BadGateway(
            "No fue posible interpretar el avance academico remoto.".to_string(),
        ),
        GetStudentAvanceError::Upstream => {
            AppError::BadGateway("Error consultando Matricula UP.".to_string())
        }
        GetStudentAvanceError::Internal => {
            AppError::Internal("Error interno de sesion.".to_string())
        }
    }
}

fn map_get_photo_error(error: GetStudentPhotoError) -> AppError {
    match error {
        GetStudentPhotoError::Unauthorized | GetStudentPhotoError::RemoteSessionExpired => {
            AppError::Unauthorized("No autenticado.".to_string())
        }
        GetStudentPhotoError::NotFound => AppError::NotFound("Foto no disponible.".to_string()),
        GetStudentPhotoError::Upstream => {
            AppError::BadGateway("Error consultando foto remota.".to_string())
        }
        GetStudentPhotoError::Internal => {
            AppError::Internal("Error interno de sesion.".to_string())
        }
    }
}

fn content_type_header(value: Option<&str>) -> HeaderValue {
    let raw = value
        .map(str::trim)
        .filter(|v| !v.is_empty())
        .unwrap_or("image/jpeg");

    HeaderValue::from_str(raw).unwrap_or_else(|_| HeaderValue::from_static("image/jpeg"))
}

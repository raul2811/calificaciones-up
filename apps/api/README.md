# API (Rust)

Backend HTTP con Axum para `calificaciones-up`.

## Ejecutar

```bash
cd apps/api
cargo run
```

Por defecto levanta en `0.0.0.0:8081`.
Carga variables desde `.env` automáticamente (si existe) usando `dotenvy`.

## Variables de entorno

- `API_ADDR` (opcional) - ejemplo: `127.0.0.1:8081`
- `FRONTEND_ORIGIN` (opcional) - ejemplo: `http://localhost:3000`
- `RUST_LOG` (opcional) - ejemplo: `api=info,tower_http=info`
- `MATRICULA_BASE_URL` (opcional) - ejemplo: `https://matricula.up.ac.pa`
- `MATRICULA_USER_AGENT` (opcional) - ejemplo: `Mozilla/5.0 ...`

# API (Rust)

Backend HTTP con Axum para `calificaciones-up`.

Estado:

- Kubernetes ready
- expone `/metrics` para Prometheus
- integra login remoto contra Matricula UP

## Operacion Rapida

- Health: `GET /health`
- Ready: `GET /ready`
- Metrics: `GET /metrics`
- CORS: responde al origen definido en `FRONTEND_ORIGIN`
- Sesiones: se guardan en memoria, asi que el API debe quedarse en 1 replica

## Ejecutar

```bash
cd apps/api
cargo run
```

Por defecto levanta en `0.0.0.0:8081`.
Carga variables desde `.env` automáticamente (si existe) usando `dotenvy`.

## Variables de entorno

- `API_ADDR` (opcional) - ejemplo: `0.0.0.0:8081`
- `FRONTEND_ORIGIN` (requerida) - ejemplo: `https://calificaciones.example.com`
- `RUST_LOG` (opcional) - ejemplo: `api=info,tower_http=info`
- `MATRICULA_BASE_URL` (requerida) - ejemplo: `https://matricula.up.ac.pa`
- `MATRICULA_USER_AGENT` (opcional) - ejemplo: `Mozilla/5.0 ...`

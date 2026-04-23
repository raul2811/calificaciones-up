# Deploy En Railway

Este monorepo esta preparado para Railway con dos servicios separados:

- `web`
- `api`

## Servicio web

Configura el servicio `web` con:

- Source Repo: este repositorio
- Root Directory: `/`
- Config as Code Path: `/apps/web/railway.toml`

Variables minimas:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_NAME` opcional

## Servicio api

Configura el servicio `api` con:

- Source Repo: este repositorio
- Root Directory: `/apps/api`
- Config as Code Path: `/apps/api/railway.toml`

Variables minimas:

- `FRONTEND_ORIGIN`
- `MATRICULA_BASE_URL` opcional
- `MATRICULA_USER_AGENT` opcional
- `RUST_LOG` opcional

## Relacion entre servicios

Usa la URL publica del servicio `api` como valor de `NEXT_PUBLIC_API_BASE_URL` en `web`.

Usa la URL publica del servicio `web` como valor de `FRONTEND_ORIGIN` en `api`.

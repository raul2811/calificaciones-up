# 🎓 Calificaciones UP

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Rust](https://img.shields.io/badge/Rust-Axum-dea584?style=for-the-badge&logo=rust)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange?style=for-the-badge)

**Calificaciones UP** es una plataforma web moderna diseñada para transformar la experiencia de consulta academica de los estudiantes de la **Universidad de Panama**. Actua como una capa de presentacion optimizada sobre la Secretaria Virtual oficial, ofreciendo una interfaz clara, rapida y navegable.

Calificaciones-UP es una propuesta de mejora visual y funcional de la plataforma oficial de consulta academica de la Universidad de Panama. En esencia, actua como una capa de presentacion renovada sobre el sistema institucional existente, con el objetivo de ofrecer una experiencia mas clara, moderna y amigable para el usuario, sin reemplazar la plataforma oficial ni alterar su funcionamiento interno.

[**Explorar Repositorio »**](https://github.com/raul2811/calificaciones-up)

---

## ✨ Caracteristicas Principales

| Funcion | Descripcion |
| :--- | :--- |
| **🚀 Dashboard Unico** | Centraliza tu estado academico y financiero en una sola vista. |
| **📊 Analiticas** | Visualiza tu progreso por periodos y estadisticas de calificaciones. |
| **🔍 Seguimiento** | Filtra materias aprobadas, pendientes, observadas o reprobadas. |
| **👤 Perfil Completo** | Acceso rapido a tu foto de estudiante y resumen de expediente. |
| **💰 Finanzas** | Visibilidad clara sobre morosidad y estatus de pagos. |

---

## 🛠️ Stack Tecnico

El proyecto esta construido bajo una arquitectura de **monorepo**, separando responsabilidades para garantizar velocidad y escalabilidad.

- **Frontend:** `Next.js 15` + `React 19` + `Tailwind CSS v4`
- **Backend:** `Rust` + `Axum`
- **Infraestructura:** `Docker` + `Docker Compose`
- **Lenguaje cliente:** `TypeScript`

---

## 🏗️ Arquitectura del Proyecto

```text
calificaciones-up/
├── apps/
│   ├── web/                # Next.js App Router
│   │   ├── Dockerfile
│   │   └── railway.toml
│   └── api/                # Rust + Axum
│       ├── Dockerfile
│       └── railway.toml
├── docs/
│   └── deployment/
│       └── railway.md
└── compose.yaml
```

---

## 🛡️ Seguridad y Alcance

> [!IMPORTANT]
> **Privacidad Primero:** Calificaciones-UP **no almacena credenciales de acceso**. El ingreso del usuario se gestiona de forma temporal y segura, unicamente para consultar la informacion academica disponible en la plataforma oficial.

El sistema emplea scraping seguro y controlado, limitado exclusivamente a la lectura de datos autorizados por el propio usuario. No retiene contrasenas, no replica bases de datos institucionales y no busca comprometer la confidencialidad de la informacion.

---

## 🚀 Guia de Inicio Rapido

### Requisitos Previos
- **Node.js** 20+
- **npm**
- **Rust** y `cargo`
- **Docker** opcional para despliegue local

### Estructura de despliegue

El repositorio esta organizado por servicio para facilitar despliegues en plataformas como Railway:

- `apps/web/Dockerfile`
- `apps/web/railway.toml`
- `apps/api/Dockerfile`
- `apps/api/railway.toml`
- `compose.yaml`
- `docs/deployment/railway.md`

### Configuracion Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

3. **Ejecucion en desarrollo:**
En terminales separadas:
```bash
cd apps/web && npm run dev
cd apps/api && cargo run
```

URLs locales:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8081`

### Comandos utiles

```bash
npm run build:web
npm run check:api
npm run docker:build:web
npm run docker:build:api
npm run docker:up
```

---

## 🐳 Despliegue con Docker

La forma mas simple de poner el sistema en marcha es usando Docker Compose:

```bash
cp .env.compose.example .env
docker compose up --build
```

Servicios expuestos por defecto:

- `http://localhost:3000`
- `http://localhost:8081`

### Verificacion de Salud
```bash
curl http://localhost:8081/health
curl http://localhost:8081/ready
```

---

## ⚙️ Configuracion (Variables de Entorno)

### Frontend

Variables relevantes:

- `NEXT_PUBLIC_API_BASE_URL` requerida
- `NEXT_PUBLIC_APP_NAME` opcional
- `NEXT_PUBLIC_SITE_URL` opcional

Importante:
`NEXT_PUBLIC_API_BASE_URL` es publica y queda embebida en el build del frontend. En produccion debe apuntar a una URL accesible desde el navegador del usuario, no a un hostname interno como `http://api:8081`.

### Backend

Variables relevantes:

- `PORT`
- `API_ADDR`
- `FRONTEND_ORIGIN`
- `RUST_LOG`
- `MATRICULA_BASE_URL`
- `MATRICULA_USER_AGENT`

Importante:
el backend soporta `PORT` para plataformas que asignan puertos dinamicos, como Railway. Si `API_ADDR` no esta definido, la app usa `PORT` y hace bind en `0.0.0.0`.

### Build manual por imagen

Frontend:
```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8081 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -t calificaciones-up-web .

docker run --rm -p 3000:3000 calificaciones-up-web
```

Backend:

```bash
docker build -t calificaciones-up-api ./apps/api

docker run --rm -p 8081:8081 \
  -e PORT=8081 \
  -e FRONTEND_ORIGIN=http://localhost:3000 \
  calificaciones-up-api
```

## Despliegue en Railway

El monorepo ya incluye config por servicio para Railway:

- `apps/web/railway.toml`
- `apps/api/railway.toml`

Resumen recomendado:

1. Crea un servicio `web` apuntando a este repo.
2. En `web`, usa `Root Directory: /` y `Config as Code Path: /apps/web/railway.toml`.
3. Crea un servicio `api` apuntando a este repo.
4. En `api`, usa `Root Directory: /apps/api` y `Config as Code Path: /apps/api/railway.toml`.
5. Configura `NEXT_PUBLIC_API_BASE_URL` en `web` con la URL publica de `api`.
6. Configura `FRONTEND_ORIGIN` en `api` con la URL publica de `web`.

Guia paso a paso:

- `docs/deployment/railway.md`

### Variables minimas en Railway

`web`:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_NAME` opcional

`api`:

- `FRONTEND_ORIGIN`
- `MATRICULA_BASE_URL` opcional
- `MATRICULA_USER_AGENT` opcional
- `RUST_LOG` opcional

## Despliegue en servidor

Recomendaciones practicas:

1. Publica `web` detras de HTTPS con un dominio propio o reverse proxy.
2. Publica `api` detras del mismo dominio o en un subdominio dedicado.
3. Construye el frontend con `NEXT_PUBLIC_API_BASE_URL` apuntando a la URL publica real del backend.
4. Configura `FRONTEND_ORIGIN` en el backend con la URL publica real del frontend para CORS.
5. Usa `GET /health` y `GET /ready` para probes de plataforma.

Ejemplo:

- frontend: `https://calificaciones.tu-dominio.com`
- backend: `https://api.calificaciones.tu-dominio.com`

Entonces:

- `NEXT_PUBLIC_API_BASE_URL=https://api.calificaciones.tu-dominio.com`
- `NEXT_PUBLIC_SITE_URL=https://calificaciones.tu-dominio.com`
- `FRONTEND_ORIGIN=https://calificaciones.tu-dominio.com`

## CI/CD y DevOps

Workflows principales:

- `CI`: corre en `push`, `pull_request` y manual para el backend Rust. Ejecuta `fmt`, `clippy` y `test`.
- `Security`: corre separado del CI normal y valida advisories, bans y licencias con `cargo audit` y `cargo deny`.
- `Docker`: construye y hace smoke-test de las imagenes `api` y `web`; publica en GHCR solo en `main` y tags compatibles.
- `Codex Manual`: workflow manual para ejecutar tareas puntuales con Codex sobre el repo.
- `Codex Review`: revision opcional de PR con Codex. Solo corre si el repositorio define `CODEX_REVIEW_ENABLED=true`.
- `Codex Autofix`: auto-fix opcional disparado por `workflow_run` cuando falla `CI`. Solo corre si `CODEX_AUTOFIX_ENABLED=true`, crea rama/PR separada y no hace merge automatico.

Que valida cada uno:

- `CI` asegura calidad base de Rust sobre `apps/api`.
- `Security` cubre vulnerabilidades conocidas, licencias permitidas y politicas de dependencias.
- `Docker` valida que las imagenes realmente construyen y arrancan; cuando publica, tambien genera attestation/provenance para las imagenes subidas.

Secrets y variables necesarios:

- `OPENAI_API_KEY`: requerido para los workflows de Codex.
- `CODEX_REVIEW_ENABLED=true`: habilita la revision automatica de PR.
- `CODEX_AUTOFIX_ENABLED=true`: habilita el autofix automatizado tras fallo de `CI`.

Validaciones locales recomendadas:

```bash
cd apps/api
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features

cd ../..
cargo audit --file apps/api/Cargo.lock
cargo deny check --manifest-path apps/api/Cargo.toml advisories bans licenses
npm run docker:build:api
npm run docker:build:web
```

Publicacion de imagen:

- La publicacion automatica ocurre desde `docker.yml` hacia `ghcr.io` solo en `push` a `main` y en tags.
- El tagging usa `sha-<sha_corto>`, tag/branch cuando aplica y `latest` solo para la rama por defecto.
- No se publica desde PRs ni desde forks via eventos de PR.

Integracion con Codex:

- Codex no recibe credenciales embebidas; usa `OPENAI_API_KEY` desde secrets.
- `Codex Review` trabaja en modo de solo lectura.
- `Codex Autofix` trabaja en rama separada y abre PR en lugar de hacer push a `main`.

Limitaciones actuales y siguientes mejoras:

- El pipeline va a exponer problemas reales del codigo actual: hoy `cargo fmt --check` y `clippy -D warnings` no pasan en `apps/api`.
- La provenance protege el origen y el flujo de build de imagenes publicadas, pero no sustituye auditorias de codigo, SBOM ni hardening de runtime.
- Mejoras razonables siguientes: fijar SHAs de actions externas, agregar SBOM, introducir una matriz adicional de Rust (`stable` + `beta` o MSRV) y separar release formal de binarios si el proyecto la necesita.

## Licencia

Este proyecto se distribuye bajo `GNU Affero General Public License v3.0 o posterior (AGPL-3.0-or-later)`.

Copyright (C) 2026 Raul Serrano

Para mas detalles, visita el [repositorio oficial](https://github.com/raul2811/calificaciones-up).

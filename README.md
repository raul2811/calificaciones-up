# Calificaciones UP

Plataforma web para consultar y organizar informacion academica relacionada con la Secretaria Virtual de la Universidad de Panama desde una experiencia mas clara, navegable y util para seguimiento estudiantil.

El proyecto esta construido como monorepo y separa la interfaz web del backend que consulta, consolida y expone los datos necesarios para autenticacion, avance academico, foto del estudiante y resumen del expediente.

Calificaciones-UP es una propuesta de mejora visual y funcional de la plataforma oficial de consulta academica de la Universidad de Panama. En esencia, actua como una capa de presentacion renovada sobre el sistema institucional existente, con el objetivo de ofrecer una experiencia mas clara, moderna y amigable para el usuario, sin reemplazar la plataforma oficial ni alterar su funcionamiento interno.

## Que resuelve

- Centraliza el estado academico y financiero en un dashboard unico.
- Permite revisar materias aprobadas, pendientes, observadas o reprobadas.
- Presenta analitica de calificaciones y progreso por periodos.
- Da visibilidad a recuperaciones, profesores y morosidad.
- Expone un backend propio para desacoplar el frontend de la fuente remota.

## Seguridad y alcance

Calificaciones-UP no almacena credenciales de acceso. El ingreso del usuario se gestiona de forma temporal y segura, unicamente para consultar la informacion academica disponible en la plataforma oficial.

El sistema emplea scraping seguro y controlado, limitado exclusivamente a la lectura de datos autorizados por el propio usuario. No retiene contrasenas, no replica bases de datos institucionales y no busca comprometer la confidencialidad de la informacion.

## Arquitectura

```text
calificaciones-up/
├── apps/
│   ├── web/    Next.js 15 + React 19
│   └── api/    Rust + Axum
├── docs/
├── Dockerfile
└── compose.yaml
```

### apps/web

Frontend en Next.js con App Router. Contiene:

- landing page y login
- dashboard academico
- modulos de plan, pendientes, analytics, recovery, profesores y morosidad
- cliente HTTP para consumir el backend
- build `standalone` para despliegue en contenedor

### apps/api

Backend en Rust con Axum. Expone:

- `POST /auth/login`
- `GET /auth/session`
- `POST /auth/logout`
- `GET /student/avance`
- `GET /student/photo`
- `GET /health`
- `GET /ready`

## Stack tecnico

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Rust`
- `Axum`
- `Tailwind CSS v4`
- `Docker / Docker Compose`

## Requisitos

Para desarrollo local:

- `Node.js 20+`
- `npm`
- `Rust` y `cargo`

Para despliegue en contenedores:

- `Docker`
- `Docker Compose`

## Variables de entorno

### Frontend

Usa el ejemplo incluido:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Variables relevantes:

- `NEXT_PUBLIC_API_BASE_URL` requerida
- `NEXT_PUBLIC_APP_NAME` opcional
- `NEXT_PUBLIC_SITE_URL` opcional

Importante:
`NEXT_PUBLIC_API_BASE_URL` es publica y queda embebida en el build del frontend. En produccion debe apuntar a una URL accesible desde el navegador del usuario, no a un hostname interno de Docker como `http://api:8081`.

### Backend

Usa el ejemplo incluido:

```bash
cp apps/api/.env.example apps/api/.env
```

Variables relevantes:

- `API_ADDR`
- `FRONTEND_ORIGIN`
- `RUST_LOG`
- `MATRICULA_BASE_URL`
- `MATRICULA_USER_AGENT`

## Desarrollo local

### 1. Instalar dependencias del monorepo

```bash
npm install
```

### 2. Levantar el frontend

```bash
cd apps/web
npm run dev
```

Frontend disponible en `http://localhost:3000`.

### 3. Levantar el backend

En otra terminal:

```bash
cd apps/api
cargo run
```

Backend disponible en `http://localhost:8081`.

### Comandos utiles

Frontend:

```bash
cd apps/web
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

Backend:

```bash
cd apps/api
cargo run
cargo check
```

## Despliegue con Docker

La forma mas simple de desplegar el proyecto completo es con `compose.yaml`.

### 1. Preparar variables para Compose

```bash
cp .env.compose.example .env
```

Valores por defecto:

- web en `http://localhost:3000`
- api en `http://localhost:8081`

### 2. Construir y levantar servicios

```bash
docker compose up --build
```

### 3. Verificar salud del backend

```bash
curl http://localhost:8081/health
curl http://localhost:8081/ready
```

## Despliegue manual por imagen

### Imagen del frontend

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8081 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -t calificaciones-up-web .

docker run --rm -p 3000:3000 calificaciones-up-web
```

### Imagen del backend

```bash
docker build -t calificaciones-up-api ./apps/api

docker run --rm -p 8081:8081 \
  -e API_ADDR=0.0.0.0:8081 \
  -e FRONTEND_ORIGIN=http://localhost:3000 \
  calificaciones-up-api
```

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

## Estado del proyecto

El repositorio ya incluye:

- frontend funcional en `apps/web`
- backend funcional en `apps/api`
- Dockerfile para `web`
- Dockerfile para `api`
- `compose.yaml` para levantar ambos servicios

## Repositorio

GitHub:

- `https://github.com/raul2811/calificaciones-up`

## Licencia

Este proyecto se distribuye bajo `GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)`.

Copyright (C) 2026 Raul Serrano

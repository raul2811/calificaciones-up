# calificaciones-up

Monorepo base:
- `apps/web` (Next.js)
- `apps/api` (reservado)
- `docs`

## Instalacion

Requisitos:
- Node.js 20+ (recomendado para Tailwind v4)
- npm

Instalar dependencias del monorepo:

```bash
npm install
```

## Variables de entorno

Crear archivo local del frontend desde el ejemplo:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Variables requeridas:
- `NEXT_PUBLIC_API_BASE_URL`

Variables opcionales:
- `NEXT_PUBLIC_APP_NAME`

## Comandos (frontend)

Desde `apps/web`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Contenedores

La app web queda empaquetada en `Dockerfile` y el backend en `apps/api/Dockerfile`.

Para levantar ambos servicios con Docker Compose:

```bash
cp .env.compose.example .env
docker compose up --build
```

Servicios expuestos:
- `http://localhost:3000` para `apps/web`
- `http://localhost:8081` para `apps/api`

Build directo del frontend:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8081 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -t calificaciones-up-web .
docker run --rm -p 3000:3000 calificaciones-up-web
```

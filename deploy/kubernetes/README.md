# Kubernetes

Base de despliegue para `Calificaciones UP`.

## Criterio de sizing

- `web`: `100m` CPU / `256Mi` memoria de request, `500m` / `512Mi` de limit.
- `api`: `100m` CPU / `256Mi` de request, `500m` / `512Mi` de limit.

Es un punto de partida conservador para un frontend Next.js y un backend Rust ligero con scraping y parsing HTML.
El frontend necesita algo mas de memoria que CPU por el servidor de Next y las respuestas SSR; el backend suele ser barato en CPU pero puede picos de memoria al procesar HTML y sesiones.

## Criterio de escalado

- `web`: escala horizontalmente con HPA desde 2 hasta 6 replicas cuando el CPU promedio pasa de 75%.
- `api`: se mantiene en 1 replica por ahora.

El backend usa sesiones en memoria, asi que escalarlo horizontalmente sin cambiar el repositorio de sesiones rompe autenticacion entre pods. Antes de habilitar HPA en `api`, hay que mover sesiones a un almacén compartido o agregar afinidad de sesion con una estrategia clara.

## Aplicacion

```bash
kubectl apply -k deploy/kubernetes/base
```

## Variables

Las direcciones publicas viven en `ConfigMap`:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `FRONTEND_ORIGIN`
- `MATRICULA_BASE_URL`
- `MATRICULA_USER_AGENT`
- `RUST_LOG`

Reemplaza los dominios de ejemplo antes de aplicar el manifiesto en un cluster real.


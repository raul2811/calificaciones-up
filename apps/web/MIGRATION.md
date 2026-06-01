# Migracion a Vite

## Resumen

La aplicación `apps/web` fue migrada desde Next.js App Router a una SPA basada en:

- Vite
- React 19
- TypeScript estricto
- Bun
- Mantine
- React Router
- TanStack Query
- Zod

## Cambios principales

1. Se eliminó App Router y toda dependencia de `next/*`.
2. Se creó bootstrap SPA con:
   - `src/main.tsx`
   - `src/App.tsx`
   - `src/routes/router.tsx`
3. Se reemplazó la navegación por `react-router-dom`.
4. Se movió la configuración pública a:
   - `VITE_API_URL`
   - `VITE_APP_NAME`
   - `VITE_SITE_URL`
5. Se añadió soporte de runtime config mediante `public/runtime-config.js` y `server.ts`.
6. Se migró la carga de sesión y expediente a TanStack Query.
7. Se añadió Playwright con un smoke test básico.

## Compatibilidad de runtime

El servidor Bun expone `/runtime-config.js` y prioriza `VITE_*`. Durante la transición también acepta `NEXT_PUBLIC_*` como fallback para no romper despliegues existentes mientras se actualizan manifests y pipelines.

## Pendientes recomendados

1. Retirar los fallbacks `NEXT_PUBLIC_*` del servidor cuando todos los entornos productivos hayan cambiado a `VITE_*`.
2. Sustituir gradualmente utilidades visuales heredadas por componentes Mantine cuando exista valor real.

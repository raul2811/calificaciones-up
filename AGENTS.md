# AGENTS

## Proposito

Monorepo de `Calificaciones UP` con backend principal en Rust (`apps/api`) y frontend en Next.js (`apps/web`).

## Stack principal

- Backend: Rust + Axum
- Frontend: Next.js 15 + React 19
- Infraestructura: Docker, GitHub Actions, GHCR

## Estandares de backend Rust

- Mantener la logica de negocio en `application/` y `domain/`, no en handlers.
- Evitar `unwrap()` y `expect()` en codigo de produccion salvo justificacion clara y acotada.
- Preferir errores tipados y propagacion explicita sobre panicos.
- Mantener cambios pequenos, verificables y con impacto local.
- Si cambian contratos o respuestas, actualizar documentacion y pruebas.

## Reglas de seguridad

- Nunca hardcodear secretos, tokens, cookies o credenciales.
- Nunca registrar credenciales, sesiones remotas o datos sensibles.
- No introducir workflows o automatizaciones con permisos mas amplios de lo necesario.
- No agregar excepciones silenciosas a seguridad, licencias o auditorias.

## Reglas de revision de PR

- Prioridad de revision: seguridad > correccion > mantenibilidad > rendimiento > velocidad.
- Buscar errores de logica, fugas de secretos, regresiones de contrato y cambios de CI/CD.
- Si se tocan dependencias, explicar impacto tecnico y operativo.
- Si se tocan Dockerfiles o workflows, explicar triggers, permisos y efecto en despliegue.

## Reglas de CI/CD

- No romper workflows existentes ni cambiar sus nombres sin necesidad fuerte.
- El workflow principal se llama `CI`; `codex-autofix.yml` depende de ese nombre.
- Mantener CI reproducible: toolchain fijado, checks explicitos y permisos minimos.
- Si se agrega tooling nuevo, justificarlo en README o en la PR.

## Cosas prohibidas

- Push directo a `main` desde automatizaciones.
- Desactivar checks para "hacer verde" el pipeline.
- Mover logica de negocio a handlers/controladores.
- Introducir secretos de ejemplo que parezcan reales.
- Hacer refactors amplios sin necesidad para resolver un fallo localizado.

## Checklist antes de proponer cambios

- El cambio es pequeno y tiene objetivo claro.
- No se introducen secretos ni permisos innecesarios.
- Si toca Rust: considerar `fmt`, `clippy` y `test`.
- Si toca dependencias: documentar impacto.
- Si toca contratos o CI/CD: actualizar documentacion relacionada.
- Si toca workflows: verificar triggers, permisos y efectos en otros workflows.

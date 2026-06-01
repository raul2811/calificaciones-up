# syntax=docker/dockerfile:1.7

FROM docker.io/oven/bun:1.3.12-debian AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM docker.io/oven/bun:1.3.12-debian AS builder

WORKDIR /app

ARG VITE_API_URL=https://example.invalid
ARG VITE_SITE_URL=https://example.invalid
ARG VITE_APP_NAME=Calificaciones\ UP
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SITE_URL=${VITE_SITE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
COPY apps/web ./apps/web

WORKDIR /app/apps/web

RUN bun run build

FROM docker.io/oven/bun:1.3.12-debian AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=bun:bun /app/apps/web/dist ./dist
COPY --from=builder --chown=bun:bun /app/apps/web/public ./public
COPY --from=builder --chown=bun:bun /app/apps/web/server.ts ./server.ts

USER bun

EXPOSE 3000

CMD ["bun", "server.ts"]

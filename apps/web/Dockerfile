# syntax=docker/dockerfile:1.7

FROM docker.io/oven/bun:1.3.12-debian AS deps

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM docker.io/oven/bun:1.3.12-debian AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL=https://example.invalid
ARG NEXT_PUBLIC_SITE_URL=https://example.invalid
ARG NEXT_PUBLIC_APP_NAME=Calificaciones\ UP
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}

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
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
#COPY --from=builder --chown=bun:bun /app/apps/web/public ./apps/web/public

USER bun

EXPOSE 3000

CMD ["bun", "apps/web/server.js"]

FROM docker.io/library/rust:1.94.0-slim-bookworm AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM docker.io/library/debian:bookworm-slim AS runner

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && useradd --system --uid 10001 --create-home appuser \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PORT=8081
ENV RUST_LOG=api=info,tower_http=info

COPY --from=builder /app/target/release/api /usr/local/bin/api

USER appuser

EXPOSE 8081

CMD ["api"]

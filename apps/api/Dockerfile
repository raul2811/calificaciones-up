FROM rust:slim-bookworm AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV API_ADDR=0.0.0.0:8081
ENV RUST_LOG=api=info,tower_http=info

COPY --from=builder /app/target/release/api ./api

EXPOSE 8081

CMD ["./api"]

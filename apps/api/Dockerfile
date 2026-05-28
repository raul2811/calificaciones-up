# syntax=docker/dockerfile:1.7

FROM docker.io/library/rust:1.94.0-slim-bookworm AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates musl-tools \
    && rustup target add x86_64-unknown-linux-musl \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    mkdir src \
    && printf 'fn main() {}\n' > src/main.rs \
    && \
    cargo fetch --locked

COPY src ./src

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    RUSTFLAGS="-C strip=symbols" cargo build --release --locked --target x86_64-unknown-linux-musl \
    && cp /app/target/x86_64-unknown-linux-musl/release/api /usr/local/bin/api

FROM scratch AS runner

WORKDIR /app

ENV PORT=8081
ENV RUST_LOG=api=info,tower_http=info

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/local/bin/api /api

USER 10001:10001

EXPOSE 8081

ENTRYPOINT ["/api"]

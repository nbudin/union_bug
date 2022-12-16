FROM node:18-bullseye-slim AS client-build

WORKDIR /build
COPY package.json yarn.lock .yarnrc.yml /build/
COPY .yarn/ /build/.yarn/
RUN yarn install

COPY . /build
RUN yarn run build

FROM debian:bookworm as server-build

RUN apt-get update && \
  apt-get install -y --no-install-recommends curl ca-certificates libdav1d-dev libclang-dev build-essential pkg-config
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

WORKDIR /build
COPY Cargo.toml .
RUN mkdir -p src && echo 'fn main() {}' > dummy.rs
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN ~/.cargo/bin/cargo build --release
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml

COPY . /build
COPY --from=client-build /build/public/ /build/public/
RUN ~/.cargo/bin/cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && \
  apt-get install -y --no-install-recommends dav1d && \
  rm -rf /var/lib/apt/lists/*

COPY --from=server-build /build/target/release/union_bug /usr/bin/union_bug
ENV RUST_LOG debug
EXPOSE 3928
WORKDIR /
CMD /usr/bin/union_bug

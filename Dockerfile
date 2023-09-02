FROM --platform=${BUILDPLATFORM} node:bookworm-slim AS client-build

WORKDIR /work

COPY . /work/
RUN yarn install && yarn run build

FROM --platform=${BUILDPLATFORM} rust:1-slim-bookworm AS server-build
ARG BUILDPLATFORM
ARG BUILDARCH
ARG TARGETARCH

ENV TARGETARCH=${TARGETARCH}
ENV BUILDARCH=${BUILDARCH}
COPY build_vars.sh /tmp/build_vars.sh

RUN bash -c "source /tmp/build_vars.sh && rustup target add \$RUST_TARGET"

RUN bash -c "source /tmp/build_vars.sh && dpkg --add-architecture \$DPKG_ARCH"
RUN bash -c "source /tmp/build_vars.sh && \
  apt-get update && \
  apt-get install -y --no-install-recommends libdav1d-dev:\$DPKG_ARCH libc6-dev:\$DPKG_ARCH \$GCC_PKG libclang-dev build-essential pkg-config && \
  rm -rf /var/lib/apt/lists/*"

WORKDIR /work
COPY . /work/
COPY --from=client-build /work/public /work/public
RUN bash -c "source /tmp/build_vars.sh && cargo build -r --target=\$RUST_TARGET"
RUN bash -c "source /tmp/build_vars.sh && mv target/\$RUST_TARGET/release/union_bug union_bug"

FROM --platform=${TARGETPLATFORM} debian:bookworm-slim
ARG TARGETPLATFORM

RUN apt-get update && \
  apt-get install -y --no-install-recommends dav1d && \
  rm -rf /var/lib/apt/lists/*

COPY --from=server-build /work/union_bug /usr/bin/union_bug
ENV RUST_LOG debug
EXPOSE 3928
WORKDIR /
CMD /usr/bin/union_bug

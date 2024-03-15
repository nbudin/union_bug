FROM --platform=${BUILDPLATFORM} debian:trixie-slim AS client-build
ARG TARGETARCH
ARG NODE_VERSION

RUN apt-get update && apt-get install -y --no-install-recommends xz-utils ca-certificates curl && rm -rf /var/lib/apt/lists/*
RUN mkdir /opt/node && \
  cd /opt/node && \
  curl https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-$(echo ${TARGETARCH} | sed 's/amd64/x64/').tar.xz | tar xJ --strip-components=1
ENV PATH=/opt/node/bin:$PATH
RUN npm install -g yarn

WORKDIR /work

COPY . /work/
RUN yarn install && yarn run build

FROM --platform=${BUILDPLATFORM} debian:trixie-slim AS server-build
ARG BUILDPLATFORM
ARG BUILDARCH
ARG TARGETARCH

ENV TARGETARCH=${TARGETARCH}
ENV BUILDARCH=${BUILDARCH}
COPY build_vars.sh /tmp/build_vars.sh
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

RUN bash -c "source /tmp/build_vars.sh && $HOME/.cargo/bin/rustup target add \$RUST_TARGET"

RUN bash -c "source /tmp/build_vars.sh && dpkg --add-architecture \$DPKG_ARCH"
RUN bash -c "source /tmp/build_vars.sh && \
  apt-get update && \
  apt-get install -y --no-install-recommends libdav1d-dev:\$DPKG_ARCH libc6-dev:\$DPKG_ARCH \$GCC_PKG libclang-dev build-essential pkg-config && \
  rm -rf /var/lib/apt/lists/*"

WORKDIR /work
COPY . /work/
COPY --from=client-build /work/public /work/public
RUN bash -c "source /tmp/build_vars.sh && $HOME/.cargo/bin/cargo build -r --target=\$RUST_TARGET"
RUN bash -c "source /tmp/build_vars.sh && mv target/\$RUST_TARGET/release/union_bug union_bug"

FROM --platform=${TARGETPLATFORM} debian:trixie-slim
ARG TARGETPLATFORM

RUN apt-get update && \
  apt-get install -y --no-install-recommends dav1d && \
  rm -rf /var/lib/apt/lists/*

COPY --from=server-build /work/union_bug /usr/bin/union_bug
ENV RUST_LOG debug
EXPOSE 3928
WORKDIR /
CMD /usr/bin/union_bug

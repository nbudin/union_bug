FROM debian:bookworm-slim
ARG TARGETARCH

RUN apt-get update && \
  apt-get install -y --no-install-recommends dav1d && \
  rm -rf /var/lib/apt/lists/*

COPY union_bug-${TARGETARCH}-unknown-linux-gnu /usr/bin/union_bug
ENV RUST_LOG debug
EXPOSE 3928
WORKDIR /
CMD /usr/bin/union_bug

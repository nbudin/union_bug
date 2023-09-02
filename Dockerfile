FROM ubuntu:jammy
ARG TARGETARCH

RUN apt-get update && \
  apt-get install -y --no-install-recommends libdav1d5 && \
  rm -rf /var/lib/apt/lists/*

COPY union_bug-${TARGETARCH}-unknown-linux-gnu /usr/bin/union_bug
RUN chmod a+x /usr/bin/union_bug
ENV RUST_LOG debug
EXPOSE 3928
WORKDIR /
CMD /usr/bin/union_bug

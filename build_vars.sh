#!/bin/bash

export TMP_CPU_ARCH=${TARGETARCH/arm64/aarch64}
export CPU_ARCH=${TMP_CPU_ARCH/amd64/x86_64}
export RUST_TARGET=$CPU_ARCH-unknown-linux-gnu
export DPKG_ARCH=$TARGETARCH
export PKG_CONFIG_SYSROOT_DIR=/usr/lib/$CPU_ARCH-linux-gnu
export PKG_CONFIG_PATH=$PKG_CONFIG_SYSROOT_DIR/pkgconfig
if [ $TARGETARCH -ne $BUILDARCH ]
then
  export GCC_PKG=gcc-12-${CPU_ARCH/x86_64/x86-64}-linux-gnu
fi

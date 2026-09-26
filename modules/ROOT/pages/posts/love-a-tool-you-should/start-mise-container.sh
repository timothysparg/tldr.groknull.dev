#!/usr/bin/env bash
set -euo pipefail

docker run --rm -it \
  -e GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
  -e MISE_GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
  -e DOCKER_HOST=unix:///var/run/docker.sock \
  -e TERM=xterm-256color \
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal \
  -e MISE_DATA_DIR=/mise \
  -e MISE_CONFIG_DIR=/mise \
  -e MISE_CACHE_DIR=/mise/cache \
  -e MISE_STATE_DIR=/mise/state \
  -e MISE_INSTALL_PATH=/usr/local/bin/mise \
  -e PATH=/mise/shims:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  --add-host host.docker.internal:host-gateway \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --entrypoint zsh \
  gold-demo-base \
  -f -i

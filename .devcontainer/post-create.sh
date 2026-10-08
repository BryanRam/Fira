#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Named volumes are created root-owned unless seeded from the image, and the
# user's UID may have been remapped to match the host (WSL/Linux). Make sure
# everything the user writes to is owned by them.
sudo chown -R "$(id -u):$(id -g)" \
  api/node_modules \
  web/node_modules \
  "${CLAUDE_CONFIG_DIR:-$HOME/.claude}" \
  /commandhistory

# The workspace is bind-mounted from the host, so its owner may not match the
# container user; stop git refusing to work with "dubious ownership".
git config --global --add safe.directory "$PWD"

(cd api && bun install --frozen-lockfile)
(cd web && npm ci)

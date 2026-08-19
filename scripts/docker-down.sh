#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.production"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env.production 不存在，按当前 compose 配置停止容器。"
  docker compose -f "$COMPOSE_FILE" down
  exit 0
fi

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down

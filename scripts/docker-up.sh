#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.production"
ENV_EXAMPLE="$ROOT_DIR/.env.production.example"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker 未安装，请先安装 Docker / Docker Compose。"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "已根据 .env.production.example 创建 .env.production"
fi

mkdir -p "$ROOT_DIR/public/uploads"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo
echo "NuxtShop 容器已启动。"
echo "访问地址: http://localhost:$(grep '^APP_PORT=' "$ENV_FILE" | cut -d '=' -f 2 || echo 4000)"
echo
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

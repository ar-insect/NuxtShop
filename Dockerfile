FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources \
  && apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY . .
RUN pnpm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["node", ".output/server/index.mjs"]

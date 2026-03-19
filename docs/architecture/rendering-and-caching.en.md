# Rendering Strategy, Caching & Logging

This document summarizes how NuxtShop uses Nuxt rendering modes, ISR
configuration and Redis for caching and logging.

It covers:

- The rendering modes in use (SSR & ISR)
- Which routes are cached and how
- How Redis is used for logs and caching
- How to inspect logs during development

## 1. Rendering modes

NuxtShop primarily uses two rendering modes:

- **SSR (Server‑Side Rendering)**  
  - Default mode for most dynamic pages (home, product list, profile, etc.)
  - The initial HTML is rendered on the server, which helps SEO and first
    paint performance.

- **ISR (Incremental Static Regeneration)**  
  - Configured via `routeRules` in `nuxt.config.ts`;
  - Allows specific routes to be statically cached and periodically regenerated.

### 1.1 Routes with ISR

Examples (simplified):

- `/docs`  
  - Uses a SWR‑style strategy (stale‑while‑revalidate);
  - First request generates the static content;
  - Subsequent requests reuse the cached HTML while a background regeneration
    updates it.

- `/products/**`  
  - Product detail pages are cached for 1 hour (3600 seconds);
  - This fits common e‑commerce patterns where product data changes
    infrequently.

See `nuxt.config.ts` for the exact `routeRules` configuration.

---

## 2. Role of Redis

Although business data is stored in MongoDB, Redis plays an important
supporting role.

### 2.1 Logging & monitoring

Redis provides a central place to store structured logs, which can later be
used to build dashboards or alerts.

- The API `server/api/log.post.ts` accepts log payloads and pushes them into
  a Redis list:
  - Key: `app:logs`
  - Value: JSON strings containing:
    - Original payload
    - Server timestamp
    - Client IP

Inspecting logs:

```bash
redis-cli LRANGE app:logs 0 20
```

### 2.2 Page & API caching

Redis can be used together with:

- Nuxt `routeRules` and ISR for HTML caching;
- Custom server utilities for JSON API caching.

Typical scenarios:

- High‑traffic product pages;
- Expensive aggregate queries (top products, analytics, etc.).

### 2.3 Behaviour when Redis is not running

In development or when Redis is unavailable:

- The app continues to function normally for all core flows;
- Logging falls back to console output;
- Cache‑backed optimizations degrade to real‑time queries.

This makes Redis an optional but recommended optimization layer.

---

## 3. Where to inspect logs

### 3.1 Console

During development:

- All server‑side errors, Mongo/Redis connection messages and cache‑related
  operations are printed to the terminal running Nuxt;
- Files that commonly log to the console include:
  - `server/plugins/mongodb.ts`
  - `server/utils/redis.ts`
  - Various route handlers under `server/api` and `modules/*/server/api`.

### 3.2 Redis list `app:logs`

As noted above:

- Log entries are stored in the `app:logs` list;
- Each entry is a JSON string with both user payload and server metadata;
- You can use `redis-cli` or any Redis GUI to inspect them.

### 3.3 MongoDB

MongoDB is used for business data only:

- Products, users, cart, orders, wishlist, reviews, addresses, ads config,
  theme preferences, etc.

By default, application logs are *not* stored in MongoDB.  
If you want persistent logs there:

- Create a dedicated collection (e.g. `app_logs`);
- Extend `server/api/log.post.ts` to insert documents into this collection;
- Optionally build dashboards or reports on top of this data.

---

## 4. Data flow summary

A simplified view of where data lives:

```text
Browser (pages / components / layouts)
        │
        ▼
Nuxt SSR / API layer (server/api + modules/*/server/api)
        │
        ├── MongoDB: products / users / cart / orders / wishlist / reviews / addresses / ads config
        └── Redis: log cache / page & API cache (with ISR)
```

You can evolve this setup by:

- Adding more ISR rules for heavy pages;
- Introducing explicit Redis caches for expensive APIs;
- Forwarding logs to external observability platforms when needed.


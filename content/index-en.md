# NuxtShop Full‑Stack E‑commerce Starter

[![CI](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml/badge.svg)](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml)
![Node](https://img.shields.io/badge/node-%3E%3D22.14.0-339933?logo=node.js&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ar-insect/NuxtShop/blob/main/LICENSE)

NuxtShop is a full‑stack e‑commerce demo application built with Nuxt 3 and a modern modular architecture.  
It integrates MongoDB persistence, Playwright E2E/BDD testing, Docker deployment, SSR and ISR, aiming to provide a realistic, readable and extensible best‑practice reference for building commerce‑style applications with Nuxt.

> Positioning: **Learning / internal scaffold‑level e‑commerce template**  
> Suitable for developers who want to quickly understand "Nuxt 3 + MongoDB + Playwright + modular architecture".

## 🧰 Tech Stack Overview

- Frontend framework: Nuxt 3 (Vue 3, `<script setup>`, Composition API)
- UI & styling: Tailwind CSS, a few TSX components, CSS‑variable‑driven theme system
- Data layer: MongoDB (products / cart / orders / wishlist / browse history / reviews / addresses / user preferences)
- Auth & sessions: custom username/password auth based on cookies
- Testing: Playwright (E2E + BDD), Vitest (unit tests)
- Deployment & runtime: Docker / PM2 / plain Node

---

## ⚡ Getting Started

### 1) Clone & Install

```bash
git clone https://github.com/ar-insect/NuxtShop.git
cd NuxtShop

# Use pnpm / npm / yarn – choose one
npm install
```

### 2) Prepare MongoDB

- Use a local MongoDB installation, or start one via Docker:

```bash
docker run -d --name nuxtshop-mongo -p 27017:27017 mongo:6
```

#### 2.1 Prepare Redis (recommended)

The project ships with **Redis‑based logging** and **page/API caching (with ISR)**.  
If Redis is not running, all core business features (products / cart / orders, etc.) still work, but:

- Logging falls back to console output;
- Cache strategies that rely on Redis gracefully degrade to real‑time computation.

To experience the full stack locally, start Redis:

```bash
docker run -d --name nuxtshop-redis -p 6379:6379 redis:7
```

### 3) Configure Environment Variables

Use separate env files for development and production:

```bash
# Development (local)
cp .env.development.example .env

# Production (on server)
cp .env.production.example .env.production
```

For development, your `.env` should at least configure:

- `MONGODB_URI`: MongoDB connection string (for example `mongodb://localhost:27017`)
- `MONGODB_DB_NAME`: database name (for example `nuxtshop`)
- Optional: admin account (if you configured it in `runtimeConfig`)

If you enable Redis, you can also configure (defaults shown in parentheses):

- `REDIS_HOST` (`localhost`)
- `REDIS_PORT` (`6379`)
- `REDIS_PASSWORD` (empty)
- `REDIS_DB` (`0`)

### 4) Start Dev Server

```bash
npm run dev
```

By default the app runs at: http://localhost:3000  
On first start, seed data will be inserted into MongoDB (products, demo users, etc.).

### 5) Common Scripts

```bash
npm run dev       # development
npm run build     # production build
npm run lint      # ESLint
npm run test:unit # unit tests (Vitest)
# For Playwright E2E / BDD, see the Testing section below
```

---

## 🚀 Features

- **Modular architecture** – business modules isolated via Nuxt layers / local modules.
- **Utility library** – common helpers for date handling, HTTP requests, validation and formatting.
- **Global components** – reusable UI such as Modal, Toast, Loading, Pagination, captcha components, etc.
- **Plugin system** – examples of creating and using Nuxt plugins.
- **Middleware** – global route middleware plus auth middleware.
- **TypeScript‑first** – strong typing across composables, server utils and domain models.
- **TSX support** – first‑class TSX/JSX components.
- **Styled Components** – `vue3-styled-components` integration for CSS‑in‑JS.
- **Tailwind CSS** – utility‑first styling across the app.
- **Automated testing** – Playwright for E2E + Gherkin‑style BDD, Vitest for units.
- **Debug configuration** – VS Code `launch.json` for client and server breakpoints.
- **SSR** – server‑rendered pages and APIs using `useAsyncData`.
- **ISR** – incremental static regeneration via `routeRules` for selected routes.
- **Data persistence & caching** – MongoDB for core business data; Redis for logging and partial page/API caching (with ISR).
- **End‑to‑end flows** – product listing & detail, cart, order management, wishlist, and a rich user profile center.

## 🌐 Internationalization (i18n)

NuxtShop ships with basic bilingual support (Chinese & English) using a lightweight custom i18n setup:

- **Message files**
  - `locales/zh-CN.ts`: Chinese strings  
  - `locales/en-US.ts`: English strings  
  - Organized by namespaces such as `ui.*`, `pages.*`, `profile.*`, `demo.*`, etc.

- **Runtime store & composable**
  - `stores/i18n.ts`: manages current `locale` and persistence (localStorage).  
  - `composables/useI18n.ts`: exposes `t(key, params?)` and `setLocale`, with placeholder support (e.g. `{count}`).

- **Default language & persistence**
  - SSR uses a default language (currently Chinese) for the initial HTML to avoid hydration mismatches.  
  - On the client, language is restored from `nuxtshop-locale` (localStorage) or inferred from the browser.  
  - Logged‑in users’ language preference is stored on the user document (`language`), so you can later drive SSR by user settings.

- **Language switch entry**
  - In the user Profile → **Preferences** section, users can choose between Simplified Chinese and English. This:
    - Updates the i18n Pinia store `locale`;
    - Writes `nuxtshop-locale` into localStorage;
    - If logged in, persists `language` via `/api/user/update`.

- **Coverage examples**
  - Header navigation and dashboard layout (Home / Profile / Cart / Wishlist, etc.).
  - Login / Register / Home / product cards / review components.
  - User center: account info, addresses, security settings, preferences, sign out.
  - Core UI components: `BaseModal`, `BaseConfirm`, `BaseLoading`, `BasePagination`, slider and puzzle captchas, etc.
  - `components-demo` page: all section titles, descriptions and buttons are fully bilingual.

To add new localized copy, extend the appropriate namespace in `locales/*` and use `useI18n().t('namespace.key')` in your components.

## 📂 Directory Structure

```bash
├── .vscode/            # VS Code debug config
├── assets/             # Static assets (CSS, images)
├── components/         # Global components (BaseButton, HomeHero, etc.)
├── composables/        # Global composables (useAuth, useToast, useConfirm, etc.)
├── content/            # Nuxt Content files
├── layouts/            # Page layouts
├── middleware/         # Global route middleware
├── modules/            # Business modules (Domain Driven Design)
│   ├── cart/           # Cart module
│   ├── order/          # Order module
│   ├── product/        # Product module
│   └── user/           # User module
├── pages/              # Top‑level pages (index.vue, login.vue, etc.)
├── plugins/            # Nuxt plugins
├── public/             # Static files
├── scripts/            # Automation scripts
├── server/             # Global server code
│   ├── api/            # Shared APIs
│   └── utils/          # Server utilities (mongodb, redis, session, etc.)
├── tests/              # Tests (E2E/BDD/units)
├── types/              # Global type definitions
├── utils/              # Client utilities
├── app.vue             # App entry
├── nuxt.config.ts      # Nuxt config
└── package.json        # Dependencies & scripts
```

## 🛠️ Modular Architecture

NuxtShop follows a DDD‑inspired modular structure. Each business domain is encapsulated in its own module, with its own components, composables, pages and server APIs.

### 1. Business Modules

- **Product module**
  - Path: `modules/product`
  - Features: product listing & search, detail pages, category filtering.
  - Key files: `useProducts.ts` (data fetching), `useCategoryMapper.ts` (category mapping).

- **Cart module**
  - Path: `modules/cart`
  - Features: cart state management, add/remove items, quantity updates, checkout flow.
  - Key files: `useCart.ts` (state), `checkout.vue` (checkout page).

- **Order module**
  - Path: `modules/order`
  - Features: create orders, list orders, order detail, history.
  - Key files: `useOrders.ts` (order logic).

  - Order types & APIs:

    | Scenario              | Type                              | Description                                                                 |
    |-----------------------|-----------------------------------|-----------------------------------------------------------------------------|
    | List API              | `OrderSummary[]`                 | `/api/orders` response with lightweight order summaries                     |
    | Detail API            | `OrderDetail`                    | `/api/orders/:id` response with full order detail                           |
    | Server storage schema | `OrderDocument extends OrderDetail` | MongoDB document shape in `server/utils/order.ts` with extra `userId`, `createdAt`, `updatedAt` fields |

- **User module**
  - Path: `modules/user`
  - Features: auth middleware, profile center logic.

### 2. Server API Conventions

To avoid route conflicts, each module exposes namespaced APIs:

- Cart: `modules/cart/server/api/cart/index.get.ts` → `/api/cart`
- Order: `modules/order/server/api/orders/index.ts` → `/api/orders`
- Product: `modules/product/server/api/products/index.get.ts` → `/api/products`

### 3. Shared Global Resources

Some utilities remain global for reuse across modules:

- **Components**: `components/ui/` (base UI), `components/home/` (home page sections).
- **Composables**: `useAuth` (auth), `useToast` (toasts), `useConfirm` (confirm dialog), etc.
- **Client utils**: e.g. `http.ts`, `format.ts`.
- **Server utils**: `server/utils/mongodb.ts`, `server/utils/redis.ts`, `server/utils/session.ts`.

### 4. Layouts

- `default`: main layout with header and footer.
- `auth`: minimal centered layout for auth pages.
- `dashboard`: sidebar layout for profile/management‑style pages.

### 5. Styling

- Tailwind CSS as the primary styling tool.
- `vue3-styled-components` for CSS‑in‑JS (see `pages/styled-demo.vue`).

### 6. Rendering Strategy

NuxtShop uses a mix of rendering strategies for performance:

- **SSR** – default mode for most dynamic pages.
- **ISR** – configured via `routeRules`, e.g.:
  - `/docs`: SWR (stale‑while‑revalidate) style caching.
  - `/products/**`: cached for 1 hour (3600 seconds) for product pages.

### 7. Caching & Logging (Redis)

All core business data lives in MongoDB; Redis is used for:

- **Logging / monitoring**
  - Centralized log cache, with room for future dashboards or alerting.
- **Page / API caching**
  - Works together with `routeRules` / ISR to cache hot pages or API responses and reduce repeated computation.

If Redis is not running, the app still functions:

- Logs fall back to console output;
- Redis‑backed cache strategies degrade to real‑time queries.

### 8. MongoDB Integration

MongoDB is the primary data store for all commerce‑related entities.

- **Configuration**
  - `nuxt.config.ts` uses `runtimeConfig` to read `MONGODB_URI` and `MONGODB_DB_NAME`.
  - `.env` sets these values for local/dev environments.

### Where to inspect logs

- **Console**  
  - In local development, all server‑side errors, Mongo/Redis connection messages, cache‑clear operations, etc. are printed to the terminal where you run Nuxt.  
  - Files like `server/plugins/mongodb.ts`, `server/utils/redis.ts` and various APIs use `console.error` / `console.log` for diagnostics.

- **Redis list (`app:logs`)**  
  - `server/api/log.post.ts` exposes a simple log ingestion endpoint, which writes structured entries into Redis:  
    - Key: `app:logs` (List).  
    - Each entry is a JSON string containing the original payload, server timestamp and client IP.  
  - You can inspect recent logs via `redis-cli`, for example:

    ```bash
    redis-cli LRANGE app:logs 0 20
    ```

- **MongoDB**  
  - MongoDB is currently used for business data only (products, users, orders, ad config, etc.) and does not store application logs directly.  
  - For production scenarios, you can extend `server/api/log.post.ts` to also persist logs into a dedicated Mongo collection if needed.

---

## 🏗 Architecture Overview

At a high level, NuxtShop follows a classic “full‑stack Nuxt app” flow:

```text
Browser (pages / components / layouts)
        │
        ▼
Nuxt SSR / API layer (server/api + modules/*/server/api)
        │
        ├── MongoDB: products / users / cart / orders / wishlist / reviews / addresses / ads config
        └── Redis: log cache / page & API cache (with ISR)
```

### Core domain modules

- **Auth / User**
  - Location: `composables/useAuth.ts`, `server/api/auth/*`, `modules/user`  
  - Responsibilities: login & registration, `auth-token` cookie, injecting current user into the app, persisting user preferences (language / timezone).
  - Server‑side auth logic is centralized in `server/utils/auth.ts`, which parses and validates the current token (currently a simple `user-jwt-token-<id>` scheme). This makes it easy to swap in real JWT / OAuth in the future by changing a single utility instead of touching every API.

- **Product**
  - Location: `modules/product`  
  - Responsibilities: product listing and search, category filters, detail pages, review lists, browse history.

- **Cart**
  - Location: `modules/cart`  
  - Responsibilities: cart state management, add/remove items, quantity updates, recommendations, checkout page (address / payment / place order).

- **Order**
  - Location: `modules/order`  
  - Responsibilities: create orders, list orders, show order details and status (pending / processing / shipped / completed / cancelled).

- **Profile**
  - Location: `pages/profile.vue`, `components/profile/*`, `modules/user`  
  - Responsibilities: basic info, avatar & display name, addresses, password change, 2FA demo, login history, theme & language/timezone preferences.

- **Ads**
  - Location: `server/api/ads.get.ts`, `pages/index.vue`, `pages/wishlist.vue`, `components/ui/BaseAdCarousel.vue`  
  - Responsibilities: read ad configuration from MongoDB (image / link / i18n key) and render ad slots on the home page and wishlist; easily extensible to more positions via the `position` field.
  - Architecture rationale:
    - Ads (image / link / i18n key) are stored as configuration documents in the `ads` Mongo collection and fetched via `/api/ads?position=home|wishlist|...`, rather than being hard‑coded in pages;
    - This allows different configurations per environment (dev / staging / prod) and paves the way for a future ops/CMS UI without changing frontend code;
    - On first access for a given `position`, a set of sample ads is seeded automatically for convenience; in real deployments you can replace them directly in MongoDB with production ad data.

---

## 👨‍💻 Developer Guide

This section is aimed at developers who want to extend or contribute to NuxtShop.

### Requirements

- Node.js: 18+ recommended  
- Package manager: npm / pnpm / yarn (examples use npm)  
- MongoDB: v6+  
- Optional: Redis 7+ (for logging & caching)

### Local workflow

1. Clone the repo & install dependencies (see **Getting Started**).  
2. Create your `.env` from `.env.example` and configure MongoDB (and optionally Redis).  
3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` and verify core flows (home, login, products, cart, profile) work.  
5. While developing:
   - For UI changes, watch the browser and devtools;  
   - For server changes (`server/api/*` or `modules/*/server/api/*`), keep an eye on terminal logs and network responses;  
   - Before committing, run:

     ```bash
     npm run lint
     npm run test:unit
     ```

### Code style & conventions

- TypeScript‑first – add types for public APIs and non‑trivial functions.  
- ESLint is used for static checks (see root config files).  
- Prefer `<script setup>` + Composition API for Vue components.  
- Inside a module, try to keep the separation of concerns: UI components / composables / server APIs, and avoid putting heavy domain logic directly in pages.

### Suggested contribution flow (optional)

If you plan to open PRs on the public repo:

1. Pull the latest `main`.  
2. Create a feature branch, e.g. `feat/profile-timezone` or `fix/cart-discount-calc`.  
3. Develop and self‑test locally: `npm run lint && npm run test:unit`.  
4. Use meaningful commit messages, e.g. `feat: add timezone preference to profile`.  
5. Open a pull request with a short description of the change and how you tested it.

---

## 🤝 Contributing

Issues and PRs are very welcome. If you’d like to contribute to NuxtShop:

- Follow the suggested workflow above (fork → feature branch → `npm run lint && npm run test:unit` → PR).  
- Keep changes consistent with the existing architecture (modules with UI / composables / server APIs) and update types / API contracts where needed.  
- For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## ⚙ Environment Variables

This section summarizes the main environment variables used by the project. See `.env.example` for reference values.

### Core connection settings

| Name              | Required | Default                 | Description                                   |
| ----------------- | -------- | ----------------------- | --------------------------------------------- |
| `MONGODB_URI`     | Yes      | `mongodb://localhost`   | MongoDB connection string                     |
| `MONGODB_DB_NAME` | Yes      | `nuxtshop`              | MongoDB database name                         |
| `REDIS_HOST`      | No       | `localhost`             | Redis host                                    |
| `REDIS_PORT`      | No       | `6379`                  | Redis port                                    |
| `REDIS_PASSWORD`  | No       | empty string            | Redis password (leave empty if not required)  |
| `REDIS_DB`        | No       | `0`                     | Redis DB index                                |

> Note: even without Redis, the app works – related logging and cache strategies gracefully degrade.

### Runtime feature flags

| Name                          | Required | Default                                 | Description                                                                                 |
| ----------------------------- | -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_DISABLE_CAPTCHA` | No       | dev/test: `1`; prod: `0` (overridable) | When set to `1`, disables captcha components on the client; defaults to off in dev/test, on in production if not explicitly set |

### Common Node / Nuxt variables

| Name       | Description                                        |
| ---------- | -------------------------------------------------- |
| `NODE_ENV` | `development` / `production` / `test`, etc.        |
| `PORT`     | Port that Nuxt listens on (defaults to `3000`)     |

For real‑world deployments you can introduce additional variables (e.g. log level, third‑party payment/storage config) and read them via `runtimeConfig` or `process.env`. When you do, it’s a good idea to update `.env.example` and this README to keep them in sync.

- **Connection management**
  - `server/utils/mongodb.ts` implements a singleton connection helper.
  - `server/plugins/mongodb.ts` (if present) connects on Nitro startup and tears down on shutdown.

- **CRUD helper functions**
  - `server/utils/mongodb.ts` exposes `find`, `findOne`, `insertOne`, `updateOne`, `deleteOne`, etc., for server APIs.

- **Core collections (examples)**
  - `shop_products_app`: products (see `server/utils/product.ts`, `modules/product/server/api/products/*.ts`)
  - `user_carts`: carts (see `server/utils/cart.ts`, `modules/cart/server/api/cart/*.ts`)
  - `user_orders`: orders (see `server/utils/order.ts`, `modules/order/server/api/orders/index.ts`)
  - `user_wishlists`: wishlists (see `server/utils/wishlist.ts`, `server/api/wishlist*.ts`)
  - `browse_history`: browse history (see `server/utils/history.ts`, `server/api/history/*.ts`)
  - Additional collections for reviews, addresses, preferences, etc.

---

Feel free to fork NuxtShop, change the branding, plug in your own APIs, or use it as a scaffold for your own Nuxt 3 commerce‑style projects.***

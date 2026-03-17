# NuxtShop Full‑Stack E‑commerce Starter

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

Create a local env file from the example:

```bash
cp .env.example .env
```

At minimum you should configure:

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

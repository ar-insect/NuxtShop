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
- **Internationalization** – built‑in Chinese & English (see `docs/architecture/i18n.en.md`).

## 🧪 Demos navigation

NuxtShop also serves as a collection of focused demos. The main example pages live under the `/demos/*` routes:

| Route              | Category  | What it demonstrates                                                                                         |
|--------------------|-----------|-------------------------------------------------------------------------------------------------------------|
| `/demos/components` | UI / TSX / Styled | Base UI components (buttons, inputs, selects, pagination, dropdowns, cards), `BaseModal` / `BaseConfirm` / `BaseLoading`, and TSX + styled‑components integration. |
| `/demos/pinia`      | State (Pinia) | Pinia basics (counter), async actions with `$onAction`, and a user store with login / profile update flows. |
| `/demos/http`       | HTTP utils | The `utils/http.ts` wrapper: GET/POST requests, file upload/download, and error handling with toasts.      |
| `/demos/ssr`        | SSR / data fetching | SSR data fetching patterns and how to distinguish server/client logic when debugging.                     |
| `/demos/plugins`    | Nuxt plugins | Using custom Nuxt plugins (`plugins/test-plugin.ts`, etc.) and accessing provided helpers in templates and scripts. |
| `/demos/utils`      | Utilities | Practical examples of common utility functions used across the app.                                       |
| `/demos/types`      | Types / models | How shared types in `types/*` are used across APIs, composables and components.                          |
| `/demos/tsx`        | TSX       | Authoring TSX components and integrating them with the existing styling system.                            |
| `/demos/styled`     | Styled Components | Using `vue3-styled-components` in SFCs and TSX components.                                             |
| `/demos/bdd`        | Testing / BDD | Playwright BDD test console: list `.feature` files, run single/all tests, and display reports and failure screenshots. |

## 🧱 Architecture overview

If you want to use NuxtShop as a team scaffold or better understand the underlying design, you can dive into these docs:

| Domain             | Doc file                         | Description                                                              |
|--------------------|----------------------------------|--------------------------------------------------------------------------|
| Auth & Security    | `docs/architecture/auth.en.md`      | Current demo token flow, `server/utils/auth.ts` entry, and how to upgrade to JWT / integrate OAuth. |
| Ads & Configuration| `docs/architecture/ads.en.md`       | MongoDB model for ads, `/api/ads` behavior, and how to extend positions. |
| Errors & Handling  | `docs/architecture/errors.en.md`    | `ApiErrorCode` list, `createApiError` conventions, and `useApiErrorHandler` flow. |
| Product            | `docs/architecture/product.en.md`   | Product data sources, `useProducts` structure, list/detail pages, history & reviews. |
| Cart               | `docs/architecture/cart.en.md`      | Local cart state + persistence API, recommendations, checkout and place‑order flow. |
| Order              | `docs/architecture/order.en.md`     | Order creation, status transitions, list/detail pages and `user_orders` Mongo schema. |

## 📂 Directory Structure (high‑level)

- `components/`: global UI and layout‑level components  
- `modules/`: domain modules (product / cart / order / user)  
- `server/`: global APIs and server‑side utilities  
- `tests/`: Playwright E2E/BDD and Vitest unit tests  
- `docs/`: architecture docs and references  

For a full tree and module‑level explanation, see `docs/reference/project-structure.en.md`.

### 6. Rendering & caching / logging

- Uses SSR by default for most dynamic pages;
- Configures ISR via `routeRules` for routes like `/docs` and `/products/**`;
- Redis is used for log storage and selected page/API caching, and gracefully degrades when Redis is not available.

See `docs/architecture/rendering-and-caching.en.md` for details.

---

For more on domain responsibilities, architecture details and developer workflow, see:

- `docs/architecture/*.en.md` – domain‑level architecture docs  
- `docs/reference/project-structure.en.md` – project structure and module responsibilities  
- `CONTRIBUTING.md` – contribution guide and recommended dev flow

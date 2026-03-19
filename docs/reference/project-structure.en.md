# Project Structure & Module Overview

This document summarizes the NuxtShop project structure and how the main
modules are organized, to help you quickly locate code.

## 1. Top‑level directory tree

```bash
├── .vscode/            # VS Code debug configuration
├── assets/             # Static assets (CSS, images)
├── components/         # Global shared components (BaseButton, HomeHero, etc.)
├── composables/        # Global composables (useAuth, useToast, etc.)
├── content/            # Nuxt Content files
├── layouts/            # Page layouts
├── middleware/         # Global route middleware
├── modules/            # Business modules (DDD‑inspired)
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
├── tests/              # Tests (E2E/BDD/unit)
├── types/              # Global type definitions
├── utils/              # Client utilities
├── app.vue             # App entry
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies & scripts
```

---

## 2. Business modules (modules/)

NuxtShop uses a DDD‑inspired structure where each domain has its own module.
Each module typically contains:

- `components/` – UI for that domain
- `composables/` – client‑side logic and state
- `pages/` – pages mounted under the module’s routes
- `server/api/` – API routes namespaced for the module

### 2.1 Product module

- Path: `modules/product`
- Responsibilities:
  - Product listing, search, category filters, detail pages
  - Review lists and browse history integration
- Key pieces:
  - `useProducts.ts` – data access and caching
  - `useCategoryMapper.ts` – category key → label mapping
  - `pages/products/index.vue` – product list
  - `pages/products/[id].vue` – product detail
  - Server utilities in `server/utils/product.ts`

### 2.2 Cart module

- Path: `modules/cart`
- Responsibilities:
  - Cart state management on the client
  - Server persistence of cart items for logged‑in users
  - `/cart` page and `/checkout` checkout flow
- Key pieces:
  - `useCart.ts` – cart state and operations
  - `pages/cart.vue` – cart view
  - `pages/checkout.vue` – checkout page
  - Server utilities in `server/utils/cart.ts`

### 2.3 Order module

- Path: `modules/order`
- Responsibilities:
  - Creating orders during checkout
  - Showing “My orders” list and order details
  - Managing order status (pending / processing / shipped / delivered / cancelled)
- Key pieces:
  - `useOrders.ts` – order list state and operations
  - `pages/orders.vue` – order list page
  - `pages/orders/[id].vue` – order detail page
  - Server utilities in `server/utils/order.ts`

### 2.4 User module

- Path: `modules/user`
- Responsibilities:
  - Auth middleware
  - Profile‑related flows (basic info, security, preferences)
- Works together with:
  - `composables/useAuth.ts`
  - `server/api/auth/*`

---

## 3. Server API conventions

To avoid conflicts and keep things discoverable, each module exposes
namespaced APIs:

- Cart: `modules/cart/server/api/cart/index.get.ts` → `/api/cart`
- Order: `modules/order/server/api/orders/index.ts` → `/api/orders`
- Product: `modules/product/server/api/products/index.get.ts` → `/api/products`

Global APIs that are not tied to a single domain live under `server/api/`,
for example:

- `server/api/auth/login.post.ts` – login
- `server/api/ads.get.ts` – ads for multiple pages

---

## 4. Shared global resources

Some utilities and UI elements are shared across modules and live in
top‑level directories.

### 4.1 Components

- `components/ui/` – base UI components  
  e.g. `BaseButton`, `BaseInput`, `BaseSelect`, `BaseModal`, `BaseToast`,
  `BaseEmpty`, `BaseAdCarousel`

- `components/layout/` – header, footer, layout‑level components  
- `components/home/` – home page sections (hero, feature cards, etc.)

### 4.2 Composables

Located in `composables/`, for example:

- `useAuth` – auth state and flows (login, logout, current user)
- `useToast` – toast notification wrapper
- `useConfirm` – confirmation modal wrapper
- `useI18n` – lightweight i18n layer
- `useApiErrorHandler` – unified error handling

### 4.3 Client utilities

Located in `utils/`, for example:

- `http.ts` – HTTP wrapper for GET/POST/DELETE/upload/download
- `format.ts` – formatting helpers

### 4.4 Server utilities

Located in `server/utils/`, for example:

- `mongodb.ts` – MongoDB connection helper and CRUD utilities
- `redis.ts` – Redis client
- `auth.ts` – auth token parsing and user lookup
- `cart.ts`, `order.ts`, `product.ts`, `wishlist.ts`, `history.ts`,
  `review.ts` – domain‑specific server helpers

---

## 5. Layouts & styling

### 5.1 Layouts (`layouts/`)

- `default` – main layout with header and footer
- `auth` – minimal centered layout for login/register pages
- `dashboard` – layout with sidebar navigation for profile‑style pages

### 5.2 Styling

- Tailwind CSS used as the primary styling solution
- `vue3-styled-components` integrated for CSS‑in‑JS examples
- Theme system based on CSS variables (colors, border radius, etc.)

---

## 6. Where to go next

For deeper explanations of each domain, see the architecture docs:

- `docs/architecture/product.en.md` – Product module
- `docs/architecture/cart.en.md` – Cart module
- `docs/architecture/order.en.md` – Order module
- `docs/architecture/auth.en.md` – Auth & security
- `docs/architecture/ads.en.md` – Ads & configuration
- `docs/architecture/errors.en.md` – Error codes & handling
- `docs/architecture/i18n.en.md` – Internationalization
- `docs/architecture/rendering-and-caching.en.md` – Rendering, caching & logging

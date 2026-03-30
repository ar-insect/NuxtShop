# NuxtShop Documentation Index

This directory contains architecture notes and reference docs for the NuxtShop
demo project. If you are new to the codebase, start here and follow the links
that match your role.

## 1. Recommended reading order

- **High‑level overview**
  - [reference/project-structure.md](reference/project-structure.md) – Chinese
  - [reference/project-structure.en.md](reference/project-structure.en.md) – English
- **API overview (for frontend/mobile/third‑party clients)**
  - [reference/api-overview.md](reference/api-overview.md)
  - [reference/api-overview.en.md](reference/api-overview.en.md)
- **Core types and response contract**
  - [architecture/types.md](architecture/types.md)
  - [architecture/types.en.md](architecture/types.en.md)

After that, dive into the domain‑specific architecture docs:

- Product: [architecture/product.md](architecture/product.md) / [architecture/product.en.md](architecture/product.en.md)
- Cart: [architecture/cart.md](architecture/cart.md) / [architecture/cart.en.md](architecture/cart.en.md)
- Order: [architecture/order.md](architecture/order.md) / [architecture/order.en.md](architecture/order.en.md)
- Auth & security: [architecture/auth.md](architecture/auth.md) / [architecture/auth.en.md](architecture/auth.en.md)
- Ads & configuration: [architecture/ads.md](architecture/ads.md) / [architecture/ads.en.md](architecture/ads.en.md)
- Rendering, caching & logging: [architecture/rendering-and-caching.md](architecture/rendering-and-caching.md) / [architecture/rendering-and-caching.en.md](architecture/rendering-and-caching.en.md)
- i18n: [architecture/i18n.md](architecture/i18n.md) / [architecture/i18n.en.md](architecture/i18n.en.md)

## 2. By persona

- **Frontend / mobile developers**
  - Start with:
    - `reference/project-structure.*`
    - `reference/api-overview.*`
    - `architecture/types.*`
  - Then read:
    - `architecture/product.*`
    - `architecture/cart.*`
    - `architecture/order.*`
    - `architecture/auth.*`

- **Backend / API developers**
  - Focus on:
    - `architecture/types.*`
    - `architecture/auth.*`
    - `architecture/product.*`
    - `architecture/order.*`
    - `architecture/ads.*`
    - `architecture/rendering-and-caching.*`

- **DevOps / deployment**
  - See:
    - [reference/release-guide.md](reference/release-guide.md)
    - [reference/release-guide.en.md](reference/release-guide.en.md)
    - `architecture/rendering-and-caching.*`
    - `architecture/errors.*` for error codes surfaced in logs and monitoring.

## 3. Conventions to keep in mind

- All stable APIs return `ApiResponse<T>` as defined in `types/common.ts`.
- Shared domain models live under `types/` and are referenced in both client
  and server code.
- Auth tokens can be sent either via the `auth-token` cookie or an
  `Authorization: Bearer ...` header; both are handled consistently by
  `server/utils/auth.ts`.

When adding new modules or endpoints, prefer updating:

- `architecture/types.*` for shared types;
- `reference/api-overview.*` for public endpoints;
- the relevant module doc under `architecture/` for design details. 

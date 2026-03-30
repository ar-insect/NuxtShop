# Core Types & ApiResponse Contract

This document summarizes the core types and response shapes shared across
NuxtShop modules, so frontend, mobile and server code can align on the same
contracts.

## 1. Unified ApiResponse shape

All stable business APIs use a unified response shape:

- In `types/common.ts`:

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

- Additionally, `types/global.d.ts` declares a global version:

```ts
declare interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}
```

Recommended usage:

- In business code and composables, always
  `import type { ApiResponse } from '~/types/common'`;
- The global declaration mainly exists for older code and quick experiments and
  should not be relied on in new code (to avoid implicit `any`).

Conventions:

- Successful responses use `code === 200`;
- Business errors are thrown via `createApiError` with an `ApiErrorPayload`;
- The client uses `useApiErrorHandler` to interpret `error.code` and decide
  whether to redirect to login, show a toast or surface form errors.

See `docs/architecture/errors.en.md` for more on error handling.

---

## 2. User & auth types

Location: `types/api.ts`.

- `UserPublic` – user view used on the client and in permissions:
  - `_id: string`
  - `username: string`
  - `role: 'admin' | 'user'`
  - optional `name`, `avatar`, `phone`, `language`, `timezone`
  - `isSuperAdmin?`, `twoFactorEnabled?`
- Login & 2FA:
  - `LoginSuccessResponse` – `{ token, user: UserPublic }`
  - `LoginTwoFactorResponse` – `{ requires2FA: true, userId, maskedPhone?, debugCode? }`
  - `LoginResponse` – union of the above
- Errors:
  - `ApiErrorCode` – enum of all standard business error codes;
  - `ApiErrorPayload` – `{ code, message, details? }`, used with `createApiError`.

The `useAuth` composable and login flows are built around these types:

- On success, `LoginSuccessResponse.token` is written to the `auth-token`
  cookie;
- `UserPublic` is used for auth state and permission checks.

---

## 3. Product & review types

### 3.1 Product

Location: `types/product.ts`.

```ts
export interface Product {
  id: number
  title: string
  price: number
  description: string
  detailHtml?: string
  category: string
  image: string
  images: string[]
  rating: {
    rate: number
    count: number
  }
  specs?: { label: string; value: string }[]
}
```

Used by:

- Product list and detail pages;
- Cart `CartItem` (extends `Product` with a `quantity` field in `useCart`);
- Wishlist and history (server utils store snapshots of `Product`);
- Orders (`OrderItem` is intentionally aligned with `Product`).

### 3.2 Product query & aggregation

Location: `server/utils/product.ts`.

- `ProductQueryParams`:
  - `page?`, `limit?`
  - `category?`
  - `query?`
  - `sort?` – `'default' | 'price-asc' | 'price-desc' | 'rating-desc'`
- `ProductQueryResult`:
  - `items: DbProduct[]`
  - `total: number`

Both `/api/products` and `/api/admin/products` are built on top of these types.

### 3.3 Review

Location: `types/review.ts`.

- `ReviewDocument` – Mongo document;
- `ReviewSummary` – `{ productId, avgRating, reviewCount }`;
- `ReviewQueryParams` / `ReviewQueryResult` – list queries.

---

## 4. Order & dashboard types

### 4.1 Order core types

Location: `types/api.ts`.

- `OrderStatus` – `'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
- `OrderSummary` – used for lists:
  - `id`, `total`, `status`, `date`
  - optional `discount`, `couponCode`, `couponName`
- `OrderItem` – aligned with `Product` fields;
- `OrderDetail` – extends `OrderSummary` with:
  - `items: OrderItem[]`
  - `shippingAddress: { name; phone; address }`

Server‑side persistence in `server/utils/order.ts`:

```ts
interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

Admin list view in `types/admin.ts`:

- `AdminOrderListItem` – same fields but with `_id`/`userId`/timestamps
  converted to strings.

### 4.2 Dashboard

Location: `types/api.ts`.

- `AdminDashboardKpi` – today’s order count, revenue, new users,
  pending shipments/cancellations;
- `AdminDashboardTrendPoint` / `AdminDashboardUserTrendPoint` – time series;
- `AdminDashboardTopProduct` / `AdminDashboardTopCategory`;
- `AdminDashboardTodoItem` / `AdminDashboardOverview` – full dashboard payload.

Used by `/api/admin/dashboard/overview`.

---

## 5. Address, coupons & security

### 5.1 Address

Location: `types/address.d.ts`.

```ts
export interface Address {
  _id?: ObjectId
  userId: ObjectId
  name: string
  phone: string
  region: string
  detail: string
  isDefault: boolean
  createdAt: Date
  updatedAt?: Date
}
```

Frontend profile components define a simplified view (stringified ids) and use
`ApiResponse<Address[]>` to interact with the APIs.

### 5.2 Coupon

Location: `types/coupon.ts` and `server/utils/coupon.ts`.

- `CouponDocument` – Mongo document;
- `CouponQueryParams` / `CouponQueryResult` – admin list queries;
- `BestCouponResult` – returned by `findBestCouponForAmount` during order
  preview.

### 5.3 Login history & 2FA

Location: `types/security.ts`.

- `LoginHistoryStatus` – `'success' | 'failed'`;
- `LoginHistoryDocument` – login history entries;
- `TwoFactorCode` – persisted 2FA codes.

---

## 6. Admin helper types

Location: `types/admin.ts`.

- `AdminProductListItem` – currently an alias of `Product` for admin lists;
- `AdminOrderListItem` – see section 4.1;
- `AdminSearchQuery` – common admin list filters:
  - `keyword?`, `field?`, `status?`, `page?`, `limit?`
- `AdsSearchQuery` – ad management filters:
  - `position?`, `status?`, `id?`, `altKey?`, `page?`, `limit?`

Used in:

- `modules/admin/pages/admin/*` – `getFilterParams` return types;
- `/api/admin/*` endpoints – query parameter and response typing.

---

## 7. Recommended usage patterns

- Server APIs:
  - Always return `ApiResponse<T>` or throw `createApiError`;
  - Keep the `data` field strongly typed (avoid `any`).
- Client code:
  - Use `http.get<ApiResponse<T>>('/path')` and read from `res.data`;
  - Reuse shared types from `types/*` instead of re‑declaring shapes locally.
- Tests:
  - Unit tests and E2E tests can import the same types to ensure fixtures stay
    in sync with business definitions.

For how these types are used in each domain, see:

- `docs/architecture/product.en.md`
- `docs/architecture/order.en.md`
- `docs/architecture/auth.en.md`
- `docs/reference/api-overview.en.md` 

# API Overview (by domain)

This document targets **frontend/mobile/third‑party consumers**. It summarizes
the main NuxtShop APIs grouped by domain.

- All business APIs use a unified response shape `ApiResponse<T>`
  (see `types/common.ts` or `types/global.d.ts`):

```ts
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

- Unless noted otherwise, all routes are prefixed with `/api`.
- Auth:
  - Accepted token sources (either is fine):
    - Cookie: `auth-token`
    - Header: `Authorization: Bearer user-jwt-token-<MongoUserId>`
  - Protected APIs use `requireUser` / `requireAdmin` from `server/utils/auth.ts`.

> This is a list of **stable public APIs**, not an exhaustive list of every
> internal/debug endpoint.

---

## 1. Auth & User

### 1.1 Login & two‑factor auth

| Method | Path                     | Description              | Body                                      | Data type (data field)                  |
| ------ | ------------------------ | ------------------------ | ----------------------------------------- | --------------------------------------- |
| POST   | `/api/auth/login`       | Username/password login  | `{ username, password }`                  | `LoginResponse` (`types/api.ts`)       |
| POST   | `/api/auth/verify-2fa`  | Verify 2FA code          | `{ userId, code }`                        | `LoginSuccessResponse`                  |

Core types in `types/api.ts`:

- `UserPublic`
- `LoginSuccessResponse` / `LoginTwoFactorResponse` / `LoginResponse`
- `ApiErrorPayload` (used together with `createApiError`)

### 1.2 Profile & preferences

| Method | Path                          | Description          | Auth         | Body / Query                                       | Data type (data field)                |
| ------ | ----------------------------- | -------------------- | ------------ | -------------------------------------------------- | ------------------------------------- |
| GET    | `/api/user/me`               | Current user profile | Required     | –                                                  | `{ user: UserPublic }`               |
| POST   | `/api/user/update`           | Update profile       | Required     | `{ name?, avatar?, phone?, language?, timezone? }` | Partial `UserPublic`                  |
| POST   | `/api/user/change-password`  | Change password      | Required     | `{ currentPassword, newPassword, confirmPassword }`| `null`                                |
| POST   | `/api/user/two-factor`       | Toggle 2FA           | Required     | `{ enabled: boolean }`                             | `{ enabled: boolean }`               |
| GET    | `/api/user/login-history`    | Recent login history | Required     | –                                                  | `LoginHistoryDocument[]`             |
| GET    | `/api/user/coupons/summary`  | Coupon summary       | Required     | –                                                  | `{ unusedCount: number }`            |

Login history type: `LoginHistoryDocument` in `types/security.ts`.

---

## 2. Product & Category

### 2.1 Public product APIs

| Method | Path                         | Description          | Query params                                                                  | Data type (data field)                        |
| ------ | ---------------------------- | -------------------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| GET    | `/api/products`             | Product list         | `page?`, `limit?`, `category?`, `query?`, `sort?` (see below)                | `{ items: Product[]; total: number }`         |
| GET    | `/api/products/:id`         | Product detail       | –                                                                             | `Product \| null`                             |
| GET    | `/api/ads`                  | Ads for positions    | `position` (`home`, `wishlist`, `admin`, …)                                   | `{ items: AdItem[] }`                         |
| GET    | `/api/history/top-products` | Trending by views    | `days?`, `limit?`                                                             | `{ items: { product: Product; views }[] }`    |
| GET    | `/api/wishlist/top-products`| Top favorited        | `days?`, `limit?`                                                             | `{ items: { product: Product; favorites }[] }`|

Types:

- `Product` – `types/product.ts`
- `AdItem` / `AdminAdDocument` – `types/ad.ts`
- Aggregation outputs – see `server/utils/history.ts` and `server/utils/wishlist.ts`.

`sort` supports the values defined in `ProductQueryParams` in
`server/utils/product.ts`:

- `'default'`
- `'price-asc'` / `'price-desc'`
- `'rating-desc'`

### 2.2 Reviews & rating

| Method | Path                          | Description          | Auth    | Body / Query                         | Data type (data field)                     |
| ------ | ----------------------------- | -------------------- | ------- | ------------------------------------ | ------------------------------------------ |
| GET    | `/api/reviews/:productId`    | Review list          | Optional| `page?`, `limit?`, `rating?`, …      | `{ items: ReviewDocument[]; total }`       |
| GET    | `/api/reviews/summary/:id`   | Rating summary       | Optional| –                                    | `{ avgRating: number; reviewCount: number }`|
| POST   | `/api/reviews/:productId`    | Create review        | Required| `{ rating, content }`                | `ReviewDocument`                           |

Types: `ReviewDocument`, `ReviewSummary`, `ReviewQueryParams`,
`ReviewQueryResult` from `types/review.ts`.

---

## 3. Cart & Order

### 3.1 Cart

| Method | Path        | Description              | Auth     | Body / Query | Data type (data field) |
| ------ | ----------- | ------------------------ | -------- | ------------ | ---------------------- |
| GET    | `/api/cart` | Get cart (if persisted)  | Required | –            | `CartItem[]`           |
| GET    | `/cart`     | Internal API for pages   | Required | –            | `CartItem[]`           |
| POST   | `/cart`     | Overwrite cart           | Required | `CartItem[]` | none (code/message)    |

`CartItem` is defined in `modules/cart/composables/useCart.ts` and extends
`Product` with a `quantity` field.

### 3.2 Orders

NuxtShop currently has a demo order module and a Mongo‑backed one. The
recommended Mongo flow uses the types from `types/api.ts`:

| Method | Path                   | Description          | Auth     | Body / Query                    | Data type (data field)                         |
| ------ | ---------------------- | -------------------- | -------- | --------------------------------| ---------------------------------------------- |
| POST   | `/orders`             | Create order         | Required | `OrderDetail`                   | demo response                                  |
| GET    | `/orders`             | Current user orders  | Required | –                                | `OrderSummary[]`                               |
| GET    | `/orders/:id`         | Order detail         | Required | –                                | `OrderDetail`                                  |
| GET    | `/api/admin/orders`   | Admin order list     | Admin    | `page, limit, status?, keyword?`| `{ items: AdminOrderListItem[]; total }`       |

Types:

- `OrderStatus`, `OrderSummary`, `OrderItem`, `OrderDetail` – `types/api.ts`
- `AdminOrderListItem` – `types/admin.ts`

---

## 4. Wishlist & History

### 4.1 Wishlist

| Method | Path            | Description              | Auth         | Body / Query | Data type (data field)          |
| ------ | --------------- | ------------------------ | ------------ | ------------ | --------------------------------|
| GET    | `/api/wishlist` | Get wishlist             | Optional\*   | –            | `Product[]` (empty if not logged in) |
| POST   | `/wishlist`     | Save wishlist            | Required     | `Product[]`  | `boolean`                        |

\*The GET endpoint returns an empty list for anonymous users instead of 401.

### 4.2 History

| Method | Path                         | Description           | Auth   | Query            | Data type (data field)                        |
| ------ | ---------------------------- | --------------------- | ------ | ---------------- | --------------------------------------------- |
| GET    | `/api/history/top-products` | Top viewed products   | Optional| `days?`, `limit?`| `{ items: { product: Product; views }[] }`    |

The actual write operations are encapsulated in the `useHistory` composable.

---

## 5. Address & Profile

### 5.1 Address management

| Method | Path                            | Description      | Auth     | Body / Query                         | Data type (data field)    |
| ------ | ------------------------------- | ---------------- | -------- | ------------------------------------ | ------------------------- |
| GET    | `/api/user/addresses`          | List addresses   | Required | –                                    | `Address[]`               |
| POST   | `/api/user/addresses`          | Create address   | Required | `Omit<Address, '_id' \| 'userId'>`    | `Address`                 |
| PUT    | `/api/user/addresses/:id`      | Update address   | Required | same as above                        | `Address`                 |
| DELETE | `/api/user/addresses/:id`      | Delete address   | Required | –                                    | boolean/none              |
| PUT    | `/api/user/addresses/:id/default` | Set as default | Required | –                                    | `{ success: true }`       |

`Address` is defined in `types/address.d.ts` (Mongo document shape). The
frontend uses a simplified version in profile components.

### 5.2 Profile & security

Covered in section 1.2 (update profile, change password, toggle 2FA).

---

## 6. Admin APIs

Admin APIs are protected by `requireAdmin` and are intended for the back‑office
UI.

### 6.1 Products & categories

| Method | Path                          | Description      | Auth  | Query / Body                                  | Data type (data field)                      |
| ------ | ----------------------------- | ---------------- | ----- | --------------------------------------------- | ------------------------------------------- |
| GET    | `/api/admin/products`        | Admin product list| Admin| `page, limit, category?, query?, sort?`      | `{ items: AdminProductListItem[]; total }`  |
| POST   | `/api/admin/products`        | Create product   | Admin | `Product` (without `id`)                      | `Product`                                   |
| PUT    | `/api/admin/products/:id`    | Update product   | Admin | `Partial<Product>`                            | `Product`                                   |
| GET    | `/api/admin/product-categories` | Category list  | Admin | filters + pagination                          | `{ items: CategoryDoc[]; total }`           |

### 6.2 Orders, users, marketing

| Method | Path                       | Description          | Auth  | Notes                                  |
| ------ | -------------------------- | -------------------- | ----- | -------------------------------------- |
| GET    | `/api/admin/orders`       | Order list           | Admin | see section 3.2                        |
| PUT    | `/api/admin/orders/:id`   | Update order status  | Admin | only `status`                          |
| GET    | `/api/admin/users`        | User list            | Admin | filterable by role/keyword             |
| GET    | `/api/admin/coupons`      | Coupon list          | Admin | pagination/keyword/enabled filters     |
| POST   | `/api/admin/coupons`      | Create coupon        | Admin |                                        |
| PUT    | `/api/admin/coupons/:id`  | Update coupon        | Admin |                                        |
| GET    | `/api/admin/ads`          | Ads list             | Admin | works with `AdsSearchQuery`            |
| POST   | `/api/admin/ads`          | Create ad            | Admin |                                        |
| PUT    | `/api/admin/ads/:id`      | Update ad            | Admin |                                        |

### 6.3 Dashboard & system settings

| Method | Path                            | Description        | Auth  | Data type (data field)          |
| ------ | ------------------------------- | ------------------ | ----- | --------------------------------|
| GET    | `/api/admin/dashboard/overview`| Dashboard overview | Admin | `AdminDashboardOverview`       |
| GET    | `/api/admin/system/settings`   | System settings    | Admin | shipping/payment configuration |
| PUT    | `/api/admin/system/settings`   | Update settings    | Admin | same shape as above            |

Types:

- `AdminProductListItem`, `AdminOrderListItem`, `AdminSearchQuery`,
  `AdsSearchQuery` – `types/admin.ts`
- `AdminDashboardOverview` and related types – `types/api.ts`

---

## 7. Error handling

- Business errors are thrown via `createApiError`, carrying an
  `ApiErrorPayload`:

```ts
interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: any
}
```

- On the client side, `useApiErrorHandler` interprets:
  - `code` to decide when to log out, redirect to login, or show a toast
  - network/unknown failures with a generic fallback message

See `docs/architecture/errors.en.md` and `types/api.ts` (`ApiErrorCode`) for
the full error code list. 

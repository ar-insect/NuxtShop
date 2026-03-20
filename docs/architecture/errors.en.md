# Error Codes & Error Handling Architecture

This document explains how NuxtShop standardizes error responses across
backend APIs and the frontend, including:

- The standard error response shape
- The `ApiErrorCode` union type
- The `createApiError` helper on the server
- The `useApiErrorHandler` composable on the client
- Guidelines for introducing new error codes

## 1. Standard error response

All errors thrown via `createApiError` eventually become HTTP responses of the
following shape:

```json
{
  "code": "AUTH_INVALID_TOKEN",
  "message": "Invalid token",
  "details": "Optional details"
}
```

Fields:

- `code` – a standardized error code (string literal union)
- `message` – default error message (debug or fallback)
- `details` – optional extra information (validation errors, low‑level messages)

The frontend prefers to display a localized string based on `code` and only
falls back to `message` when no translation exists.

---

## 2. Error code type: `ApiErrorCode`

In `types/api.ts` the project defines a union of all known error codes:

```ts
export type ApiErrorCode =
  | 'AUTH_MISSING_CREDENTIALS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_REGISTER_MISSING_FIELDS'
  | 'AUTH_REGISTER_PASSWORD_MISMATCH'
  | 'AUTH_REGISTER_PASSWORD_WEAK'
  | 'AUTH_REGISTER_USERNAME_EXISTS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_FORBIDDEN'
  | 'USER_UPDATE_EMPTY'
  | 'USER_UPDATE_FAILED'
  | 'USER_NOT_FOUND'
  | 'ADDRESS_MISSING_FIELDS'
  | 'ADDRESS_INVALID_ID'
  | 'ADDRESS_NOT_FOUND'
  | 'ADDRESS_CREATE_FAILED'
  | 'ADDRESS_UPDATE_FAILED'
  | 'ADDRESS_DELETE_FAILED'
  | 'ADDRESS_SET_DEFAULT_FAILED'
  | 'ADDRESS_FETCH_FAILED'
  | 'REVIEW_MISSING_FIELDS'
  | 'REVIEW_CREATE_FAILED'
  | 'THEME_MISSING_CONFIG'
  | 'THEME_UPDATE_FAILED'
  | 'THEME_FETCH_FAILED'
  | 'CART_SAVE_FAILED'
```

Characteristics:

- Each code is mirrored in the i18n files under `error.codes.<CODE>`
  (`locales/zh-CN.ts` / `en-US.ts`);
- The `code` field of `createApiError` is typed as `ApiErrorCode`, preventing
  arbitrary strings;
- Adding a new code requires updating both `ApiErrorCode` and the i18n
  `error.codes` map.

---

## 3. Server‑side helper: `createApiError`

Location: `server/utils/api-error.ts`

```ts
import type { ApiErrorCode } from '~/types/api'

export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: any
}

interface CreateApiErrorOptions extends ApiErrorPayload {
  statusCode: number
}

export const createApiError = (options: CreateApiErrorOptions) => {
  const { statusCode, code, message, details } = options

  return createError({
    statusCode,
    statusMessage: message,
    data: {
      code,
      message,
      details
    }
  })
}
```

### Usage patterns

1. **Validation errors** – missing or invalid fields:

```ts
if (!username || !password) {
  throw createApiError({
    statusCode: 400,
    code: 'AUTH_MISSING_CREDENTIALS',
    message: 'Please provide username and password',
    details: null
  })
}
```

2. **Business pre‑conditions / not found**:

```ts
if (!user) {
  throw createApiError({
    statusCode: 404,
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    details: null
  })
}
```

3. **Internal errors / DB failures**:

```ts
try {
  // ...
} catch (error) {
  console.error('Error updating user profile:', error)
  throw createApiError({
    statusCode: 500,
    code: 'USER_UPDATE_FAILED',
    message: 'Failed to update profile',
    details: error instanceof Error ? error.message : String(error)
  })
}
```

### Conventions

- `code` represents the error *type*; it should be stable and mapped in i18n;
- `message` is a human‑readable default/fallback;
- `details` is for debugging and should avoid leaking secrets (connection
  strings, full stack traces, etc.).

---

## 4. Frontend handler: `useApiErrorHandler`

Location: `composables/useApiErrorHandler.ts`

Key flow (simplified):

```ts
const handleError = (error: unknown) => {
  const e = error as ApiErrorLike
  const status = e?.statusCode
  const code = e?.data?.code as ApiErrorCode | undefined
  const fallbackMessage = e?.data?.message || e?.message || t('demo.components.toast.errorMsg')

  let localized = fallbackMessage
  if (code) {
    const key = `error.codes.${code}`
    const translated = t(key)
    if (translated !== key) {
      localized = translated
    }
  }

  if (code?.startsWith('AUTH_')) {
    toast.error(localized)
    if (status === 401 && code !== 'AUTH_INVALID_CREDENTIALS' && code !== 'AUTH_MISSING_CREDENTIALS') {
      const token = useCookie('auth-token')
      const user = useState('auth-user', () => null)
      token.value = null
      user.value = null
      router.push('/login')
    }
    return
  }

  toast.error(localized)
}
```

### Message priority

The handler chooses what to show in this order:

1. If `code` is present and `t('error.codes.' + code)` returns a translation,
   use that.
2. Else use `error.data.message` if available.
3. Else fall back to a generic message like
   `t('demo.components.toast.errorMsg')`.

### Special treatment for auth errors

For codes starting with `AUTH_`:

- Always show an error toast;
- If the HTTP status is `401` and the code is not a “credentials” error, the
  handler:
  - Clears the `auth-token` cookie and `auth-user` state;
  - Redirects to `/login`.

This unifies the experience for expired/invalid tokens, while still treating
“wrong password” as a normal form error.

---

## 5. Overall error flow (text diagram)

From backend to the user:

```text
Backend API
  └─ Business logic / DB calls
      ├─ success → return { data }
      └─ failure → throw createApiError({ statusCode, code, message, details })
            ↓
Nitro / $fetch
  └─ Converts createError to HTTP response:
      - status: statusCode
      - body.data: { code, message, details }
            ↓
utils/http.ts
  └─ Throws an error object with .statusCode and .data
            ↓
Page / composable
  └─ catch(e) → useApiErrorHandler().handleError(e)
            ↓
useApiErrorHandler
  └─ Resolves localized message based on error.data.code
  └─ For AUTH_* codes, clears auth state and redirects if needed
            ↓
UI
  └─ Toast / message / navigation
```

---

## 6. Designing new error codes

When introducing a new API, follow these steps:

1. Pick a domain prefix:
   - `AUTH_` – authentication & authorization
   - `USER_` – user accounts
   - `ADDRESS_` – addresses
   - `REVIEW_` – reviews
   - `THEME_` – theme preferences
   - `CART_` – cart
   - `ORDER_` – orders (future/extended use)

2. Use consistent verb patterns:
   - `*_MISSING_FIELDS` – required parameters missing
   - `*_INVALID_*` – invalid parameter formats/values
   - `*_NOT_FOUND` – entity does not exist
   - `*_CREATE_FAILED` / `*_UPDATE_FAILED` / `*_DELETE_FAILED` – DB errors

3. Add the new code to `ApiErrorCode` in `types/api.ts`.

4. Add translations in both `locales/zh-CN.ts` and `locales/en-US.ts` under
   `error.codes.<NEW_CODE>`.

5. Use `createApiError` with the new code in your API handlers and rely on
   `useApiErrorHandler` on the frontend.

Following this pattern keeps error handling predictable, localized and
type‑safe across the entire project.

# Auth Architecture & JWT/OAuth Upgrade Guide

This document describes how authentication works in NuxtShop and how you can
evolve the current “demo token” into a production‑grade JWT or OAuth flow.

It covers:

- The current token format and where it is used
- Server‑side helpers in `server/utils/auth.ts`
- How to upgrade to JWT (step‑by‑step)
- How to integrate OAuth / third‑party login providers
- Security‑related runtime configuration

## 1. Current demo auth flow

### 1.1 Token format

For simplicity, the project currently uses a “fake JWT”:

```text
user-jwt-token-<MongoUserId>
```

- Issued by `/api/auth/login` after a successful username/password check
- Stored on the client in the `auth-token` cookie
- Read by all protected APIs via `server/utils/auth.ts`

### 1.2 Server‑side helpers: `server/utils/auth.ts`

Key helpers:

- `getAuthToken(event)`  
  Reads the token from the `auth-token` cookie or the `Authorization: Bearer`
  header.

- `parseUserIdFromToken(token)`  
  Verifies the `user-jwt-token-` prefix and validates that `<id>` is a valid
  Mongo `ObjectId`. Returns the string userId or `null`.

- `requireUserId(event)`  
  - Uses `getAuthToken` + `parseUserIdFromToken`
  - On missing token → throws `AUTH_UNAUTHORIZED`
  - On invalid token → throws `AUTH_INVALID_TOKEN`
  - On success → returns `userId: string`

- `requireUser(event)`  
  - Calls `requireUserId` and then looks up the user in MongoDB
  - Throws `AUTH_USER_NOT_FOUND` if the user does not exist
  - Returns the full user document

All protected APIs (addresses, theme preferences, cart persistence, reviews,
etc.) only depend on these helpers, so switching to a real JWT/OAuth scheme
is mostly a matter of updating this file and the login endpoint.

---

## 2. Upgrading to JWT

For a production system you’ll typically want to use standard JWTs.

### 2.1 Add configuration

Add environment variables:

- `JWT_SECRET` – strong random secret for signing JWTs
- `JWT_EXPIRES_IN` – expiration, e.g. `7d` or `1h`

In `nuxt.config.ts` you can expose them via `runtimeConfig`:

```ts
runtimeConfig: {
  // ...
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
}
```

> Never hard‑code secrets in the repo – always read them from env.

### 2.2 Issue JWT in `/api/auth/login`

In `server/api/auth/login.post.ts`:

- After validating credentials and loading the user from Mongo, replace the
  current demo token:

```ts
// current demo behaviour
const token = `user-jwt-token-${user._id}`
```

with something like:

```ts
const config = useRuntimeConfig()

const token = jwt.sign(
  {
    sub: String(user._id),
    role: user.role
  },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
)
```

The client does not need to change – it still stores whatever token is
returned in the `auth-token` cookie.

### 2.3 Parse and validate JWT in `parseUserIdFromToken`

Update `parseUserIdFromToken` to verify JWTs:

```ts
import jwt from 'jsonwebtoken'

export const parseUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwt.secret) as { sub?: string }

    if (!payload.sub || !ObjectId.isValid(payload.sub)) {
      return null
    }

    return payload.sub
  } catch {
    return null
  }
}
```

`requireUserId` and `requireUser` can stay as they are – they only care if
`parseUserIdFromToken` returns a valid string.

### 2.4 Refresh tokens & logout

- **Refresh**  
  Optionally, when a user hits a protected endpoint and the token is close to
  expiry, you can issue a fresh token in the response and let the client
  update the cookie.

- **Logout**  
  The current “demo” logout simply clears the cookie and local state. For
  stronger guarantees:
  - Use a token blacklist stored in Redis or Mongo; or
  - Use short‑lived access tokens + refresh tokens and rotate them.

---

## 3. OAuth / third‑party login

To integrate GitHub / Google / corporate SSO:

1. Add a route like `/auth/oauth/:provider` that redirects to the provider.
2. Implement a callback endpoint:
   - Use the provider SDK or HTTP APIs to fetch the user profile;
   - Find or create a local user based on provider ID/email;
   - Issue your own JWT and set `auth-token` cookie.
3. From this point on, your business APIs still only rely on `requireUser` and
   the local user model.

This keeps the rest of the codebase independent from specific providers and
makes it easy to add or remove OAuth integrations.

---

## 4. Runtime configuration & security notes

Authentication is closely tied to several `runtimeConfig` and env variables:

- **MongoDB** (`MONGODB_URI`, `MONGODB_DB_NAME`)
  - Use different DBs / clusters for dev, staging and prod;
  - Require authentication and IP whitelisting in production.

- **Redis** (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`)
  - Optional but recommended for caching and logging;
  - In production, use strong passwords and private networks.

- **Admin account** (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
  - Demo defaults are `admin` / `123456` for local usage only;
  - In production, always override them in `.env.production` with strong
    random values or force admins to change password on first login.

When you switch to JWT/OAuth, revisit these settings and ensure:

- Secrets are not committed to the repo;
- Cookies are `HttpOnly` + `Secure` in production;
- Token lifetimes and refresh policies match your security requirements.


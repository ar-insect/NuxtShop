# Ads Module Architecture

This document describes the Ads module in NuxtShop, including:

- How ad data is stored in MongoDB
- How `/api/ads` works
- How the frontend displays ads
- How to add new positions (`position`) for different pages

## 1. Overview

Ads are used in the project to:

- Show promotional banners below the home page hero section
- Show an ad block on the wishlist page

The content of these ads (image, link, i18n key) is not hard‑coded in Vue
components. Instead, it is stored in MongoDB so that:

- You can change ads without touching frontend code
- Different environments (dev / staging / prod) can have different ads
- It is easy to extend the system into a CMS or admin UI later

Main files:

- API: `server/api/ads.get.ts` → `/api/ads?position=...`
- Types: `types/api.ts` (`AdItem`)
- Usage:
  - Home page: `pages/index.vue`
  - Wishlist: `pages/wishlist.vue`
  - UI component: `components/ui/BaseAdCarousel.vue`

---

## 2. MongoDB model & data structure

Ads are stored in a Mongo collection, conceptually like:

```ts
interface AdDocument {
  _id?: ObjectId
  position: string
  image: string
  link: string
  altKey: string
  createdAt: Date
  updatedAt: Date
}
```

The public API type used by the frontend is defined in `types/api.ts`:

```ts
export interface AdItem {
  id: number
  image: string
  link: string
  altKey: string
}
```

- `position`: ad slot identifier, e.g.:
  - `home-banner`
  - `wishlist-sidebar`
  - You can add more, such as `checkout-sidebar`, `orders-empty`, etc.
- `image`: image URL (relative path or full CDN URL)
- `link`: click‑through link (internal route or external URL)
- `altKey`: i18n key resolved by the frontend via `t(altKey)`

---

## 3. `/api/ads` API behaviour

Endpoint: `GET /api/ads?position=<position>`

High‑level logic:

1. Read `position` from query – if missing, either use a default or return an
   empty list.
2. Query the `ads` collection for documents matching that `position`.
3. If the collection is empty (first run or not seeded yet), seed sample ads
   for that `position` and query again.
4. Map results to `AdItem[]` and return:

```ts
interface AdsResponse {
  items: AdItem[]
}
```

Error handling uses `createApiError` with custom error codes (e.g.
`ADS_FETCH_FAILED` if you decide to introduce one) and is then mapped by
`useApiErrorHandler` on the client.

---

## 4. Frontend display & i18n

### 4.1 BaseAdCarousel

The main UI component for ads is `BaseAdCarousel`:

- Renders a carousel of `AdItem[]`
- Does not hard‑code any copy; instead, it:
  - Displays `image`
  - Uses `link` for click‑through
  - Passes `altKey` to `useI18n().t(altKey)` to get localized text

Typical usage:

```vue
<BaseAdCarousel :items="ads">
  <!-- Optional slots for custom CTA / copy -->
</BaseAdCarousel>
```

### 4.2 Page usage

Example on the home page:

1. Use `useAsyncData` or a composable to call `/api/ads?position=home-banner`.
2. Pass the returned `items` to `BaseAdCarousel`.
3. Define i18n entries for each `altKey` in `locales/zh-CN.ts` and
   `locales/en-US.ts`, e.g.:

```ts
pages: {
  home: {
    adElectronics: 'Electronics deals',
    adJewelery: 'Jewelery spotlight',
    adMen: 'Menswear picks',
    // ...
  }
}
```

This keeps ad content fully data‑driven and language‑aware.

---

## 5. Adding a new ad position

To add an ad slot for a new page or scenario:

### 5.1 Choose a `position` name

Use `page-location` style naming:

- `checkout-sidebar`
- `orders-empty`
- `profile-bottom`

### 5.2 Seed Mongo data

Insert new documents into the `ads` collection, e.g.:

```ts
db.ads.insertMany([
  {
    position: 'checkout-sidebar',
    image: '/images/ads/checkout-1.jpg',
    link: '/products/1',
    altKey: 'checkout.adSpecialOffer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ...
])
```

Also add the corresponding `altKey` translations in all locales.

### 5.3 Integrate on the page

On the target page (e.g. `/checkout`):

1. Fetch ads via `/api/ads?position=checkout-sidebar`.
2. Render them with `BaseAdCarousel` or a custom layout component.

---

## 6. Caching & performance

Ad data typically changes infrequently, so it fits well with caching:

- Use Nuxt `routeRules` + ISR for pages that contain ads;
- Or add a small Redis cache inside the ads API for individual positions.

The key idea is that the business layer only knows about “get ads by position”,
while the data & caching layer can evolve independently (Mongo only, or
Mongo + Redis, or even a remote CMS) without changing the page components.


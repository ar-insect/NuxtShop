# Product Module Architecture

This document describes the Product module in NuxtShop, including:

- Data models and MongoDB storage
- The product list and detail flows
- Search, category filters and sorting
- How Product interacts with Cart, Wishlist, Reviews and History

## 1. Responsibilities & location

- Directory: `modules/product`
- Responsibilities:
  - Product listing & pagination
  - Category filters & search
  - Product detail pages (gallery, rating, rich description)
  - Integration with cart, wishlist, reviews, browse history

Key files:

- Composables:
  - `modules/product/composables/useProducts.ts`
  - `modules/product/composables/useCategoryMapper.ts`
- Pages:
  - `modules/product/pages/products/index.vue`
  - `modules/product/pages/products/[id].vue`
- Server:
  - `server/utils/product.ts`
  - `modules/product/server/api/products/*.ts`

---

## 2. Data model & data source

### 2.1 Frontend Product type

Defined in `useProducts.ts`:

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
}
```

### 2.2 MongoDB seeding & utilities

In `server/utils/product.ts`:

- Collection: `shop_products_app`
- Seed source: `server/data/products.ts`
- On first access, `ensureProductsSeeded` populates the collection with sample
  products, including rich HTML descriptions.

Utility functions:

- `findAllProducts()`
- `findProductById(id: number)`
- `queryProducts(params: ProductQueryParams)` – paged, filterable query

`ProductQueryParams` typically includes:

- `page`, `limit`
- `category`
- `query` (search term)
- `sort` (e.g. price, rating, newest)

---

## 3. List page flow: `/products`

Page: `modules/product/pages/products/index.vue`

Responsibilities:

- Show a product grid with loading skeletons
- Support search, category filters and sorting
- Sync state with URL query parameters
- Provide SEO‑friendly titles and meta

Data flow:

1. Read query params from the route:
   - `page`, `category`, `q`, `sort`
2. Call `useProducts().getProducts(page, limit, category, query, sort)`
   which hits the `/products` API.
3. Map the response `{ items, total }` to:
   - `products` – list of `Product`
   - `total`, `totalPages`
4. Render:
   - Skeletons while loading
   - Product grid with cards
   - A common empty state when no results are found
   - `BasePagination` for page navigation

Category labels come from `useCategoryMapper` so that they can be localized
and styled consistently.

---

## 4. Detail page flow: `/products/:id`

Page: `modules/product/pages/products/[id].vue`

Responsibilities:

- Load a single product by ID
- Render an image gallery (thumbnails + main image)
- Display price, rating, rich description, category tags
- Integrate “Add to cart” and “Add to wishlist”
- Show reviews and browse history

Data & interactions:

- `useProducts().getProductById(id)` calls `/products/:id` to load the product.
- Rating summary is fetched from `/reviews/summary/:id`.
- Browse history is maintained via `useHistory` and displayed as a “recently
  viewed” section.
- “Add to cart” uses `useCart().addToCart(product)`:
  - If the user is not logged in, it opens the login modal.
- Wishlist uses `useWishlist` and a heart‑icon button.

The page uses i18n keys and ARIA attributes extensively:

- A visually hidden `<h1>` for screen readers;
- `alt` text for all images;
- `aria-label` and `aria-live` for error and empty states.

---

## 5. Interaction with other modules

- **Cart**  
  Product cards and the detail page call `useCart.addToCart` with a `Product`,
  which is wrapped as a `CartItem` on the cart side.

- **Wishlist**  
  A product can be toggled in/out of the wishlist via `useWishlist`, relying on
  core fields like `id`, `title`, `image`.

- **Orders**  
  `OrderItem` mirrors key `Product` fields so that order detail views can
  show familiar product information.

- **Reviews**  
  The detail page integrates with the Reviews APIs to show star ratings and
  review lists, and to submit new reviews.

- **History**  
  `useHistory` writes an entry every time a product detail page is viewed.
  Aggregated endpoints provide “most viewed in the last 7 days” lists.

---

## 6. Extension ideas

Depending on your needs, you can extend the Product module by:

- Expanding the product schema (e.g. inventory, brand, attributes)
- Adding more filters: price ranges, tags, “on sale”, etc.
- Introducing personalized or ML‑driven “recommended products”
- Splitting product data into separate collections (e.g. SEO vs. inventory)
- Adding a “compare products” feature powered by shared types

The existing structure (composables + pages + Mongo utils) is designed to make
these changes straightforward without breaking existing flows.


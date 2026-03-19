# Cart Module Architecture

This document describes the Cart module in NuxtShop, including:

- Cart data model
- Frontend state management & server persistence
- Cart page `/cart` and checkout page `/checkout`
- Collaboration with Product, Order and Auth modules

## 1. Responsibilities & location

- Directory: `modules/cart`
- Responsibilities:
  - Manage cart state on the client
  - Synchronize cart with the server for logged‑in users
  - Render the cart page `/cart`
  - Implement checkout flow on `/checkout`

Key files:

- Composable:
  - `modules/cart/composables/useCart.ts`
- Pages:
  - `modules/cart/pages/cart.vue`
  - `modules/cart/pages/checkout.vue`
- Server:
  - `modules/cart/server/api/cart/index.get.ts`
  - `modules/cart/server/api/cart/index.post.ts`
  - `server/utils/cart.ts`
  - Mongo collection: `user_carts`

---

## 2. Data model & `useCart`

### 2.1 CartItem type

`CartItem` extends `Product` with a quantity:

```ts
export interface CartItem extends Product {
  quantity: number
}
```

### 2.2 `useCart` composable

Responsibilities:

- Global cart state:
  - `cartItems`: `CartItem[]`
  - `cartTotal`: total price (often stored in cents)
  - `cartCount`: total quantity
- Initialization:
  - On first use on the client, calls `useFetch('/api/cart', { server: false })`
    to pull the server cart (if logged in).
- Operations:
  - `addToCart(product: Product)`
  - `removeFromCart(productId: number)`
  - `updateQuantity(productId: number, quantity: number)`
  - `clearCart()`
  - `refreshCart()`
  - `resetCartLocal()`

Each mutating operation calls `saveCart()` internally to synchronize with the
server via `http.post('/cart', cartItems.value)`.

---

## 3. Server persistence

### 3.1 GET `/api/cart`

File: `modules/cart/server/api/cart/index.get.ts`

- Reads user ID from the auth token (via `getAuthToken` + `parseUserIdFromToken`);
- If the user is not logged in, returns an empty array;
- If logged in, calls `findCartByUserId(userId)` from `server/utils/cart.ts`.

### 3.2 POST `/api/cart`

File: `modules/cart/server/api/cart/index.post.ts`

- Uses `requireUserId(event)` and throws `AUTH_UNAUTHORIZED` if not logged in;
- Reads cart items from the request body;
- Calls `saveCartForUser(userId, items)` to upsert the document in MongoDB;
- On failure, throws `createApiError({ code: 'CART_SAVE_FAILED', ... })`.

### 3.3 MongoDB schema

`server/utils/cart.ts` defines:

```ts
interface CartDocument {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}
```

- Collection: `user_carts`
- `findCartByUserId(userId)` – returns the current cart for that user
- `saveCartForUser(userId, items)` – upserts the cart and updates `updatedAt`

---

## 4. Cart page `/cart`

Page: `modules/cart/pages/cart.vue`

Responsibilities:

- Display current cart items with quantity pickers;
- Allow removal of items and clearing the whole cart;
- Show subtotal and total summary;
- Display recommended products when the cart is empty;
- Provide a “Proceed to checkout” button.

Key behaviours:

- Uses `useCart` for all state and operations;
- Uses `BaseEmpty` for the empty state, with i18n text and a link back to
  `/products`;
- Uses `BaseButton` for primary actions, and integrates with the login modal
  for unauthenticated users.

When the user clicks “Checkout”, the page may:

- Ask for confirmation (e.g. via `useConfirm`);
- Navigate to `/checkout` to complete the purchase.

---

## 5. Checkout page `/checkout`

Page: `modules/cart/pages/checkout.vue`

Responsibilities:

- Let users select or add a shipping address;
- Let users choose a payment method;
- Show an order summary (items + totals);
- Create an order via the Order module and clear the cart.

Key pieces:

- **Addresses**
  - Fetched from `/api/user/addresses`;
  - Users can select, add, update and delete addresses;
  - Reuses the same data model as the Profile→Addresses section.

- **Payment methods**
  - Defined locally as a list of payment options;
  - Rendered as radio buttons / cards.

- **Order creation**

  ```ts
  const { cartItems, cartTotal, clearCart } = useCart()
  const { createOrder } = useOrders()

  const order = await createOrder(cartItems.value, cartTotal.value, {
    name: fullName,
    phone: form.phone,
    address: fullAddress
  })

  await clearCart()
  ```

  After success:

  - Show a success toast;
  - Redirect to the Orders page or the order detail.

---

## 6. Collaboration with other modules

- **Product**  
  The Cart module builds `CartItem` directly from `Product`, so any product
  with `id/title/image/price` fields can be added to the cart.

- **Auth**  
  - Anonymous users see an empty server cart but can still build a local cart;
  - When they log in, the cart can be synchronized with the server;
  - Protected endpoints (`/api/cart`) require auth and use standardized
    auth error codes.

- **Order**  
  Checkout uses `createOrder` from `useOrders`, passing `CartItem[]` and
  total price. Once the order is created, the cart is cleared.

- **Profile / Address**  
  Checkout reuses the address management APIs from the Profile module to
  fetch and persist delivery addresses.

---

## 7. Extension ideas

Some common directions to extend the Cart module:

- Add coupon/discount support (fields on `CartItem` or an order‑level
  discount structure);
- Implement a “Buy now” flow that bypasses the cart for single‑item orders;
- Enforce inventory checks on the server when placing orders;
- Add A/B‑tested recommendations on the cart page using product analytics;
- Persist cart snapshots for analytics and “restore cart” features.


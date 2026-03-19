# Order Module Architecture

This document describes the Order module in NuxtShop, including:

- Order types and data model
- MongoDB storage and APIs
- The `useOrders` composable
- The Orders list and detail pages
- Collaboration with Cart and Auth

## 1. Responsibilities & location

- Directory: `modules/order`
- Responsibilities:
  - Create orders after checkout
  - List orders for the current user
  - Display order details and status
  - Delete or clear orders (mainly for demos/testing)

Key files:

- Composable: `modules/order/composables/useOrders.ts`
- Pages:
  - `modules/order/pages/orders.vue`
  - `modules/order/pages/orders/[id].vue`
- Server:
  - `modules/order/server/api/orders/index.ts`
  - `modules/order/server/api/orders/[id].get.ts`
  - `server/utils/order.ts`
  - Collection: `user_orders`
- Types: `OrderStatus`, `OrderSummary`, `OrderItem`, `OrderDetail` in
  `types/api.ts`

---

## 2. Types & data model

In `types/api.ts`:

```ts
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderSummary {
  id: string
  total: number
  status: OrderStatus
  date: string
}

export interface OrderItem {
  id: number
  title: string
  image: string
  price: number
  quantity: number
  category?: string
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
  }
}
```

MongoDB documents extend `OrderDetail`:

```ts
interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

Mapping:

- List API → `OrderSummary[]`
- Detail API → `OrderDetail`
- Storage → `OrderDocument`

---

## 3. Server APIs

### 3.1 `/api/orders` – list / create / delete / clear

File: `modules/order/server/api/orders/index.ts`

Auth:

- Relies on the `auth-token` cookie with a `user-jwt-token-<id>` style value;
- `<id>` must be a valid Mongo `ObjectId`;
- Invalid or missing tokens result in `401`.

Handlers:

- **GET** – list orders for the current user:
  - Calls `findOrdersByUserId(userObjectId)`;
  - Maps to `OrderSummary[]`.

- **POST** – create an order:

  ```ts
  const body = await readBody<OrderDetail>(event)
  const order = await insertOrder(userObjectId, body)
  return { success: true, order }
  ```

- **DELETE** – delete one or clear all:
  - If `clear=true` in the query string:
    - Call `clearOrdersByUser(userObjectId)`
  - Else, if `id` is present:
    - Call `deleteOrderByUser(userObjectId, orderId)`

### 3.2 `/api/orders/:id` – detail

File: `modules/order/server/api/orders/[id].get.ts`

The current implementation in the repo uses a Redis + session example to
store order details. In a production setup, you would typically unify this
with the MongoDB implementation in `server/utils/order.ts` and read from
`user_orders` instead.

---

## 4. `useOrders` composable

File: `modules/order/composables/useOrders.ts`

Responsibilities:

- Manage the order list state (`orders`);
- Lazily fetch the list from `/api/orders`;
- Provide operations to create and delete orders.

Key logic:

```ts
const orders = useState<OrderSummary[]>('orders', () => [])
const ordersInitialized = useState<boolean>('orders-fetched', () => false)

if (!ordersInitialized.value) {
  const { data } = useFetch<OrderSummary[]>('/api/orders', { key: 'orders-data', lazy: true })
  watch(data, (newOrders) => {
    if (newOrders) orders.value = newOrders
  }, { immediate: true })
  ordersInitialized.value = true
}
```

Creating an order:

```ts
const createOrder = async (items: CartItem[], total: number, address: ShippingAddress) => {
  const newOrder: OrderDetail = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    total,
    status: 'pending',
    date: new Date().toISOString(),
    items,
    shippingAddress: address
  }

  await http.post('/orders', newOrder)
  orders.value.unshift({
    id: newOrder.id,
    total: newOrder.total,
    status: newOrder.status,
    date: newOrder.date
  })
  return newOrder
}
```

Deleting an order:

- `deleteOrder(id)` calls `http.delete('/orders', { id })`;
- On success, removes the order from `orders.value`.

---

## 5. Orders list page `/orders`

Page: `modules/order/pages/orders.vue`

Responsibilities:

- Show the current user’s orders;
- Provide status filter tabs (all / pending / processing / shipped / delivered / cancelled);
- Provide actions to view details, reorder, and delete orders;
- Show appropriate empty states.

Key points:

- Protected with `definePageMeta({ middleware: 'auth' })`;
- Uses `useOrders()` for list state and `deleteOrder`;
- Derives `filteredOrders` based on the selected status tab;
- Uses `BaseEmpty` when:
  - `orders.length === 0` → “no orders yet” + “start shopping” button;
  - `filteredOrders.length === 0` → “no orders under current filter”, with
    `status` + `aria-live="polite"` for screen readers.

Each order card typically displays:

- Order ID and date
- Total amount
- Status badge (with i18n label)
- Action buttons for details, reorder, etc.

---

## 6. Order detail page `/orders/:id`

Page: `modules/order/pages/orders/[id].vue`

Responsibilities:

- Load and display a single order (`OrderDetail`);
- Show status, item list, totals and shipping address;
- Provide SEO‑friendly title and i18n labels.

Key points:

- Uses `useFetch<OrderDetail>(/api/orders/:id)` to load the order;
- Renders:
  - Status text (`pages.orders.detail.status*`);
  - Address labels (`shippingNameLabel`, `shippingPhoneLabel`, etc.);
- Also protected by `definePageMeta({ middleware: 'auth' })`.

---

## 7. Collaboration with other modules

- **Cart / Checkout**
  - Checkout page calls `createOrder(cartItems, cartTotal, shippingAddress)`
    after validating form data;
  - After creating an order, `clearCart()` is called to reset the cart.

- **Auth**
  - All order APIs and pages require authentication;
  - 401 responses trigger centralized handling in `useApiErrorHandler`, which
    clears auth state and redirects to `/login` when appropriate.

- **Product**
  - `OrderItem` mirrors `Product` fields so you can reuse UI and pricing logic
    when displaying items inside orders.

---

## 8. Extension ideas

To further enhance the Order module, consider:

- Adding more statuses (e.g. refunded, partially shipped);
- Storing and showing shipment tracking information;
- Recording an order “activity log” (status change history) for support;
- Adding indexes on `userId` and `date` to optimize listing queries;
- Integrating payment providers and persisting payment status per order.


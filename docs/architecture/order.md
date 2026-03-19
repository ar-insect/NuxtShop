# Order 模块架构说明

本篇文档介绍订单 (Order) 模块的整体设计，包括：

- 订单类型与数据模型；
- 服务端存储结构与 API 设计；
- 前端 `useOrders` 状态管理；
- 我的订单列表页与详情页的数据流；
- 与购物车、认证、支付流程的协作关系。

## 1. 模块职责与位置

- 目录：`modules/order`
- 主要职责：
  - 创建订单（结算后写入数据库）；
  - 获取当前用户订单列表；
  - 展示订单详情与状态；
  - 删除订单、清空订单（主要用于调试 / 测试）。

相关文件：

- 组合式：
  - `modules/order/composables/useOrders.ts` – 订单列表状态与操作。
- 页面：
  - `modules/order/pages/orders.vue` – 我的订单列表页；
  - `modules/order/pages/orders/[id].vue` – 订单详情页。
- 服务端：
  - `modules/order/server/api/orders/index.ts` – 列表 / 创建 / 删除 / 清空；
  - `modules/order/server/api/orders/[id].get.ts` – 获取单个订单详情；
  - `server/utils/order.ts` – MongoDB 中的订单存储；
  - 集合名：`user_orders`。
- 类型：
  - `types/api.ts` 中的 `OrderStatus` / `OrderSummary` / `OrderItem` / `OrderDetail`。

## 2. 类型与数据模型

在 `types/api.ts` 中：

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

在 `server/utils/order.ts` 中，MongoDB 文档类型扩展了 `OrderDetail`：

```ts
interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

由此构成了「前端类型」与「后端存储结构」之间的映射：

- 列表 API：返回 `OrderSummary[]`（轻量）；
- 详情 API：返回 `OrderDetail`；
- Mongo 文档：`OrderDocument`（添加 `userId` 与时间字段）。

## 3. 服务端 API 设计

### 3.1 `/api/orders` – 列表 / 创建 / 删除 / 清空

文件：`modules/order/server/api/orders/index.ts`

- 认证：
  - 使用 `auth-token` Cookie；
  - 要求 token 形如 `user-jwt-token-<id>`，并校验 `<id>` 是否为合法 ObjectId；
  - 非法或缺失 token 时返回 401。

- GET – 获取当前用户订单列表：
  - 调用 `findOrdersByUserId(userObjectId)`；
  - 将 `OrderDetail[]` 映射为 `OrderSummary[]` 返回。

- POST – 创建订单：
  - 从请求体读取 `OrderDetail`；
  - 调用 `insertOrder(userObjectId, body)` 将其写入 MongoDB；
  - 返回 `{ success: true, order }`。

- DELETE – 删除 / 清空订单：
  - Query 参数：
    - `id` – 要删除的具体订单 ID（可选）；
    - `clear=true` – 清空当前用户所有订单；
  - `clear=true` 时调用 `clearOrdersByUser(userObjectId)`；
  - 否则调用 `deleteOrderByUser(userObjectId, orderId)` 删除单个订单。

### 3.2 `/api/orders/:id` – 详情

文件：`modules/order/server/api/orders/[id].get.ts`

> 当前实现示例使用 Redis + sessionId 存储订单详情，生产环境建议统一迁移至 MongoDB（参考 `server/utils/order.ts`）。你可以将此文件视为一个备用实现模板。

## 4. 前端状态管理：`useOrders`

文件：`modules/order/composables/useOrders.ts`

职责：

- 管理订单列表状态 `orders`；
- 首次使用时从 `/api/orders` 拉取订单列表；
- 提供创建、刷新、删除订单的前端 API。

关键逻辑：

- 初始化：

  ```ts
  const orders = useState<Order[]>('orders', () => [])
  const ordersInitialized = useState<boolean>('orders-fetched', () => false)

  if (!ordersInitialized.value) {
    const { data } = useFetch<Order[]>('/api/orders', { key: 'orders-data', lazy: true })
    watch(data, (newOrders) => { if (newOrders) orders.value = newOrders }, { immediate: true })
    ordersInitialized.value = true
  }
  ```

- 创建订单：
  - `createOrder(items: CartItem[], total: number, address)`：
    - 生成一个 `id: ORD-<timestamp>-<random>`；
    - 组装 `OrderDetail` 并通过 `http.post('/orders', newOrder)` 写入服务端；
    - 成功后，将一个 `OrderSummary` 插入本地 `orders` 列表头部。

- 删除订单：
  - `deleteOrder(id)` 调用 `http.delete('/orders', { id })`，并在成功后从本地 `orders` 列表移除对应订单。

- 其它：
  - `refreshOrders()` – 从 `/orders` 刷新订单列表（当前用于调试/扩展）；
  - `resetOrdersLocal()` – 清空本地缓存（如登出时使用）。

## 5. 我的订单页 `/orders`

页面文件：`modules/order/pages/orders.vue`

职责：

- 展示订单列表；
- 支持按状态筛选（全部 / 待付款 / 处理中 / 已发货 / 已完成 / 已取消）；
- 支持删除订单、再次购买；
- 使用空态组件展示「没有订单」与「当前筛选无结果」。

关键点：

- 经 `definePageMeta({ middleware: 'auth' })` 保护，必须登录；
- 使用 `useOrders()` 获取 `orders` 与 `deleteOrder`；
- 通过本地计算属性 `filteredOrders` 根据当前选中的状态标签进行过滤；
- 当 `orders.length === 0` 时：
  - 使用 `BaseEmpty` 展示“暂无订单”空态，并提供“去逛逛”按钮；
- 当 `filteredOrders.length === 0` 时：
  - 使用带 `status + aria-live="polite"` 的 `BaseEmpty`，让读屏用户听到「当前筛选条件下没有订单」。

订单卡片展示：

- 订单号、下单时间、金额；
- 使用 badge 显示订单状态（`pending` / `processing` / `shipped` / `completed` / `cancelled`），文案来自 i18n；
- 提供查看详情 / 再次购买 / 售后 / 删除等操作按钮。

## 6. 订单详情页 `/orders/:id`

页面文件：`modules/order/pages/orders/[id].vue`

职责：

- 根据 ID 加载并展示单个订单详情；
- 显示订单状态、商品列表、价格信息、收货地址；
- 提供 SEO 友好 title；
- 对未登录用户使用 middleware 进行保护。

关键点：

- `useFetch<OrderDetail>(\`/api/orders/${id}\`)` 获取订单详情；
- 使用 i18n 文案渲染：
  - 状态文本：`pages.orders.detail.status*`；
  - 地址展示标签：`shippingNameLabel` / `shippingPhoneLabel` / `shippingAddressLabel`；
- 同样通过 `definePageMeta({ middleware: 'auth' })` 做访问控制。

## 7. 与其他模块的协作

- **Cart / Checkout**：
  - 结算页 `/checkout` 在校验地址与支付方式后，调用 `createOrder(cartItems, cartTotal, shippingAddress)` 创建订单；
  - 创建成功后调用 `clearCart()` 清空购物车。

- **Auth**：
  - 所有订单 API 和页面都要求登录；未登录访问会收到 401 或被 middleware 重定向到登录；
  - 在 E2E 测试中，也会通过登录步骤来验证订单创建 / 列表 / 删除流程。

- **Product**：
  - `OrderItem` 结构与 `Product` 类似，便于在订单详情中复用商品展示组件或价格计算逻辑。

## 8. 扩展建议

你可以在现有订单模块基础上继续扩展：

- 支持更多订单状态（如已退款、部分发货等）；
- 在订单详情中增加物流信息、支付信息等字段；
/- 为订单引入“操作日志”（状态流转记录），便于售后追踪；
- 在 MongoDB 中按索引优化订单查询（如按 `userId` + `date` 建复合索引）。


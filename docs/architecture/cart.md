# Cart 模块架构说明

本篇文档介绍购物车 (Cart) 模块的整体设计，包括：

- 购物车数据模型；
- 前端状态管理与服务端持久化；
- 购物车页与结算页的职责划分；
- 与商品、订单、认证模块的协作。

## 1. 模块职责与位置

- 目录：`modules/cart`
- 主要职责：
  - 维护购物车本地状态；
  - 与服务器同步购物车（登录用户）；
  - 购物车列表页 `/cart` 展示与交互；
  - 结算页 `/checkout`：收货地址、支付方式、下单流程。

相关文件：

- 组合式：
  - `modules/cart/composables/useCart.ts` – 购物车状态与操作；
- 页面：
  - `modules/cart/pages/cart.vue` – 购物车列表页面；
  - `modules/cart/pages/checkout.vue` – 结算页；
- 服务端：
  - `modules/cart/server/api/cart/index.get.ts` – 获取当前用户购物车；
  - `modules/cart/server/api/cart/index.post.ts` – 保存当前用户购物车；
  - `server/utils/cart.ts` – 使用 MongoDB 持久化购物车；
  - Mongo 集合：`user_carts`。

## 2. 数据模型与前端状态

### 2.1 CartItem 类型

在 `useCart.ts` 中，购物车项基于 Product 进行扩展：

```ts
export interface CartItem extends Product {
  quantity: number
}
```

### 2.2 useCart 组合式

`useCart` 管理购物车全局状态：

- 状态：
  - `cartItems` – 购物车商品列表（Pinia-like `useState`）；
  - `cartTotal` – 购物车总价（以“分”为单位计算避免精度问题）；
  - `cartCount` – 商品总数。
- 初始化：
  - 使用 `useFetch('/api/cart', { server: false })` 在客户端首次调用时拉取一次服务器购物车；
  - 结果写入 `cartItems`。
- 操作方法：
  - `addToCart(product: Product)` – 若存在则数量 +1，否则新增；调用 `saveCart` 同步到服务器；
  - `removeFromCart(productId: number)` – 移除商品并保存；
  - `updateQuantity(productId, quantity)` – 更新数量（最小 1）并保存；
  - `clearCart()` – 清空并保存；
  - `refreshCart()` – 从 `/cart` API 强制刷新购物车；
  - `resetCartLocal()` – 仅重置前端状态（不发请求），用于登出等场景。

`saveCart()` 内部通过 `http.post('/cart', cartItems.value)` 调用服务器持久化接口。

## 3. 服务端持久化设计

### 3.1 API 与权限

#### GET `/api/cart`

文件：`modules/cart/server/api/cart/index.get.ts`

- 从 Cookie / token 中解析用户 ID（通过 `getAuthToken` + `parseUserIdFromToken`）；
- 若未登录，返回空数组（前端会禁用“加入购物车”按钮）；
- 若已登录，通过 `findCartByUserId(userId)` 返回购物车 items。

#### POST `/api/cart`

文件：`modules/cart/server/api/cart/index.post.ts`

- 使用 `requireUserId(event)` 强制登录；
- 从请求体中读取购物车 items；
- 通过 `saveCartForUser(userId, items)` 将数据写入 MongoDB；
- 失败时使用 `createApiError({ code: 'CART_SAVE_FAILED', ... })` 抛出统一错误。

### 3.2 MongoDB 模型

文件：`server/utils/cart.ts`

```ts
interface CartDocument {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}
```

- 集合名：`user_carts`；
- `findCartByUserId(userId)` – 读取该用户购物车；
- `saveCartForUser(userId, items)` – upsert 当前用户购物车并更新 `updatedAt`。

## 4. 购物车页面 `/cart`

页面文件：`modules/cart/pages/cart.vue`

职责：

- 展示当前购物车列表；
- 支持数量调整、删除商品、清空购物车；
- 显示价格汇总信息；
- 展示“推荐商品”区域；
- 提供跳转到结算页 `/checkout` 的按钮。

主要点：

- 使用 `useCart` 获取 `cartItems`, `cartTotal`, `cartCount` 等；
- 推荐商品通过 `http.get<Product[]>('/products/recommended')` 等接口获取，在空态时展示统一提示；
- 点击“结算”按钮前会弹出确认对话框（`useConfirm`），确认后跳转到 `/checkout`。

空态与可访问性：

- 当购物车为空时，使用 `BaseEmpty` 统一展示空态文案与“去逛逛”按钮；
- 列表使用 `role="list"` + `li` 语义标签，配合 i18n 文案。

## 5. 结算页面 `/checkout`

页面文件：`modules/cart/pages/checkout.vue`

职责：

- 选择/新增收货地址；
- 选择支付方式；
- 展示订单汇总（商品列表 + 总价）；
- 调用订单模块创建订单，并清空购物车。

关键逻辑：

- 地址管理：
  - 通过 `/api/user/addresses` 获取服务器保存的地址列表；
  - 支持选择默认地址、删除地址、新增地址；
  - 新增地址通过 Profile 的 API 进行持久化。
- 支付方式：
  - 使用本地数组 `paymentMethods` 描述支付方式（支付宝、微信等）；
  - 使用单选按钮 + 卡片进行选择。
- 提交订单：

  ```ts
  const { cartItems, cartTotal, clearCart } = useCart()
  const { createOrder } = useOrders()

  // 校验表单后：
  const order = await createOrder(cartItems.value, cartTotal.value, {
    name: fullName,
    phone: form.phone,
    address: fullAddress
  })
  await clearCart()
  ```

- 创建成功后：
  - 使用 toast 提示成功；
  - 跳转到 `orders` 页面或订单详情。

## 6. 与其他模块的协作

- **Product**：CartItem 直接扩展自 Product，列表与详情页中的“加入购物车”按钮使用 `useCart.addToCart`；
- **Auth**：未登录用户访问 `/api/cart` 返回空数组；前端按钮会根据 `useAuth().user` 是否存在来决定是否允许加入购物车，并在未登录时弹出登录弹窗；
- **Order**：`createOrder` 依赖 `CartItem[]` 与 `cartTotal` 来生成 `OrderDetail`，并写入 `user_orders` 集合；
- **Profile / Address**：结算页读取和管理 `/api/user/addresses`，与 Profile 中地址管理复用同一数据源。

## 7. 扩展建议

可以根据业务需要扩展购物车模块：

- 为 CartItem 增加优惠信息字段（如 `discount`, `couponId`），在结算时计算实际应付金额；
- 新增“立即购买”流程，绕过购物车直接生成临时订单；
- 在服务端添加“库存校验”逻辑，防止超卖；
- 在 MongoDB 中记录购物车快照，用于分析用户购物行为或恢复购物车。


# API 总览（按模块）

本篇文档面向 **前端 / 移动端 / 第三方调用方**，按领域模块梳理 NuxtShop 主要接口。

- 所有业务接口均使用统一响应结构 `ApiResponse<T>`（定义见 `types/common.ts` 或 `types/global.d.ts`）：

```ts
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

- 未特别说明时，接口前缀均为 `/api`。
- 认证说明：
  - 支持两种 Token 传递方式（二选一）：
    - Cookie：`auth-token`
    - Header：`Authorization: Bearer user-jwt-token-<MongoUserId>`
  - 需要登录的接口统一通过 `server/utils/auth.ts` 中的 `requireUser` / `requireAdmin` 校验。

> 注意：下表为“主要稳定接口”，并非所有内部调试接口的完整列表。

---

## 1. Auth & User 模块

### 1.1 登录与 2FA

| 方法 | 路径                    | 说明                 | 请求体                                     | 响应数据类型                    |
| ---- | ----------------------- | -------------------- | ------------------------------------------ | ------------------------------- |
| POST | `/api/auth/login`      | 用户名密码登录       | `{ username, password }`                   | `LoginResponse`（见 `types/api`） |
| POST | `/api/auth/verify-2fa` | 验证两步验证码       | `{ userId, code }`                         | `LoginSuccessResponse`          |

核心类型见 `types/api.ts`：

- `UserPublic`
- `LoginSuccessResponse` / `LoginTwoFactorResponse` / `LoginResponse`
- `ApiErrorPayload`（错误统一走 `createApiError`）

### 1.2 用户信息与偏好

| 方法 | 路径                          | 说明               | 认证         | 请求体 / Query                                       | 响应数据类型                     |
| ---- | ----------------------------- | ------------------ | ------------ | ---------------------------------------------------- | -------------------------------- |
| GET  | `/api/user/me`               | 获取当前登录用户   | 必须登录     | –                                                    | `{ user: UserPublic }`          |
| POST | `/api/user/update`           | 更新个人资料       | 必须登录     | `{ name?, avatar?, phone?, language?, timezone? }`  | 更新后的 `UserPublic` 字段子集 |
| POST | `/api/user/change-password`  | 修改密码           | 必须登录     | `{ currentPassword, newPassword, confirmPassword }` | `null`（成功只返回 code/message） |
| POST | `/api/user/two-factor`       | 开关二步验证       | 必须登录     | `{ enabled: boolean }`                              | `{ enabled: boolean }`          |
| GET  | `/api/user/login-history`    | 最近登录历史       | 必须登录     | –                                                    | `LoginHistoryDocument[]`        |
| GET  | `/api/user/coupons/summary`  | 可用优惠券数量摘要 | 必须登录     | –                                                    | `{ unusedCount: number }`       |

相关类型：

- 登录历史：`types/security.ts` 中的 `LoginHistoryDocument`
- 地址等见下文「地址与收货信息」小节。

---

## 2. Product & Category 模块

### 2.1 前台商品接口

| 方法 | 路径                    | 说明                   | Query 参数                                                                 | 响应数据类型                               |
| ---- | ----------------------- | ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| GET  | `/api/products`         | 商品列表               | `page?`, `limit?`, `category?`, `query?` (搜索词), `sort?`（见下）        | `{ items: Product[]; total: number }`      |
| GET  | `/api/products/:id`     | 单个商品详情           | –                                                                          | `Product \| null`                          |
| GET  | `/api/ads`              | 广告位数据             | `position`（如 `home` / `wishlist` / `admin` 等）                         | `{ items: AdItem[] }`                      |
| GET  | `/api/history/top-products` | 浏览历史 Top 商品    | `days?`, `limit?`                                                          | `{ items: { product: Product; views }[] }` |
| GET  | `/api/wishlist/top-products` | 收藏 Top 商品       | `days?`, `limit?`                                                          | `{ items: { product: Product; favorites }[] }` |

相关类型：

- 商品：`types/product.ts` 中的 `Product`
- 广告：`types/ad.ts` 中的 `AdItem` / `AdminAdDocument`
- 历史与收藏统计：`server/utils/history.ts`、`server/utils/wishlist.ts` 中的聚合结果。

`sort` 参数支持值（见 `server/utils/product.ts` 中的 `ProductQueryParams`）：

- `'default'`（按 id）
- `'price-asc'` / `'price-desc'`
- `'rating-desc'`（综合评分与评价数）

### 2.2 评价与评分

| 方法 | 路径                          | 说明                   | 认证     | 请求 / Query                         | 响应数据类型                             |
| ---- | ----------------------------- | ---------------------- | -------- | ------------------------------------ | ---------------------------------------- |
| GET  | `/api/reviews/:productId`    | 某商品的评价列表       | 可匿名   | `page?`, `limit?`, `rating?` 等      | `{ items: ReviewDocument[]; total }`     |
| GET  | `/api/reviews/summary/:id`   | 某商品评分摘要         | 可匿名   | –                                    | `{ avgRating: number; reviewCount: number }` |
| POST | `/api/reviews/:productId`    | 新增评价               | 必须登录 | `{ rating, content }`                | `ReviewDocument`                         |

类型见 `types/review.ts`：

- `ReviewDocument`
- `ReviewSummary`
- `ReviewQueryParams` / `ReviewQueryResult`

---

## 3. Cart & Order 模块

### 3.1 购物车

| 方法 | 路径           | 说明                     | 认证         | 请求体 / Query      | 响应数据类型    |
| ---- | -------------- | ------------------------ | ------------ | ------------------- | --------------- |
| GET  | `/api/cart`    | 获取当前用户购物车（若有） | 必须登录     | –                   | `CartItem[]`    |
| GET  | `/cart`        | 应用内部接口（前台页面用） | 必须登录     | –                   | `CartItem[]`    |
| POST | `/cart`        | 覆盖式保存购物车         | 必须登录     | `CartItem[]`        | 无（仅 code）   |

Cart 类型定义：

- `modules/cart/composables/useCart.ts` 中的 `CartItem extends Product`

### 3.2 下单与订单

业务上订单模块有两套实现（模块内 demo 版与全局 Mongo 版）。当前推荐以 **Mongo 版** 为主：

| 方法 | 路径                   | 说明                 | 认证     | 请求体/Query                               | 响应数据类型                      |
| ---- | ---------------------- | -------------------- | -------- | ------------------------------------------ | --------------------------------- |
| POST | `/orders`             | 创建订单             | 必须登录 | `OrderDetail`（见 `types/api.ts`）        | 创建结果（demo 版）              |
| GET  | `/orders`             | 获取当前用户订单列表 | 必须登录 | –                                          | `OrderSummary[]`                 |
| GET  | `/orders/:id`         | 获取订单详情         | 必须登录 | –                                          | `OrderDetail`                    |
| GET  | `/api/admin/orders`   | 后台订单列表         | 管理员   | `page, limit, status?, keyword?` 等        | `{ items: AdminOrderListItem[]; total }` |

核心类型：

- `OrderStatus` / `OrderSummary` / `OrderItem` / `OrderDetail` – `types/api.ts`
- 管理端列表项：`AdminOrderListItem` – `types/admin.ts`（字符串化 `_id`/`userId`/时间字段）

> 结算页 `/cart/checkout` 内部调用的预览接口以代码为准（`modules/cart/pages/checkout.vue`），当前 demo 仍以直接计算 / 优惠券查询为主。

---

## 4. Wishlist & History 模块

### 4.1 收藏夹

| 方法 | 路径             | 说明                 | 认证     | 请求体 / Query | 响应数据类型              |
| ---- | ---------------- | -------------------- | -------- | -------------- | ------------------------- |
| GET  | `/api/wishlist`  | 获取当前用户收藏列表 | 可匿名\* | –              | `Product[]`（未登录返回空数组） |
| POST | `/wishlist`      | 保存收藏列表         | 必须登录 | `Product[]`    | `boolean`（成功为 `true`）    |

说明：

- 读取接口会先尝试从 token 中解析 userId；未登录用户返回空数组，不报错。
- 写接口 `POST /wishlist` 必须登录，使用 `requireUserId` 强制校验 token。

### 4.2 浏览历史

| 方法 | 路径                          | 说明                    | 认证   | Query                 | 响应数据类型                                   |
| ---- | ----------------------------- | ----------------------- | ------ | --------------------- | ---------------------------------------------- |
| GET  | `/api/history/top-products`  | 最近 N 天浏览最多的商品 | 可匿名 | `days?`, `limit?`     | `{ items: { product: Product; views }[] }`     |

实际浏览记录写入在 `useHistory` 组合式中完成（前端调用 `/api/history` 系列接口）。

---

## 5. Address & Profile 模块

### 5.1 地址管理

| 方法 | 路径                           | 说明             | 认证     | 请求体 / Query                   | 响应数据类型      |
| ---- | ------------------------------ | ---------------- | -------- | -------------------------------- | ----------------- |
| GET  | `/api/user/addresses`         | 地址列表         | 必须登录 | –                                | `Address[]`       |
| POST | `/api/user/addresses`         | 新增地址         | 必须登录 | `Omit<Address, '_id' \| userId>` | `Address`         |
| PUT  | `/api/user/addresses/:id`     | 更新地址         | 必须登录 | 同上                              | `Address`         |
| DELETE | `/api/user/addresses/:id`   | 删除地址         | 必须登录 | –                                | `boolean`/无      |
| PUT  | `/api/user/addresses/:id/default` | 设为默认地址  | 必须登录 | –                                | `{ success: true }` |

类型见 `types/address.d.ts`：

- `Address`：Mongo 文档结构（包含 `_id`/`userId`/时间字段）

前端在 Profile 组件中定义了简化版 `Address` 用于渲染和表单。

### 5.2 个人资料与安全

参见上文 Auth & User 小节，主要由 `/api/user/update`、`/api/user/change-password`、`/api/user/two-factor` 等接口组成。

---

## 6. Admin 模块 API 概览

以下接口供管理后台使用，一般需要 `Admin` 权限（`requireAdmin`）：

### 6.1 商品与分类

| 方法 | 路径                     | 说明                 | 认证   | 请求体 / Query                          | 响应数据类型                               |
| ---- | ------------------------ | -------------------- | ------ | --------------------------------------- | ------------------------------------------ |
| GET  | `/api/admin/products`   | 商品列表             | 管理员 | `page, limit, category?, query?, sort?` | `{ items: AdminProductListItem[]; total }` |
| POST | `/api/admin/products`   | 新建商品             | 管理员 | `Product`（不含 id，由服务端生成）     | `Product`                                  |
| PUT  | `/api/admin/products/:id` | 更新商品           | 管理员 | `Partial<Product>`                      | `Product`                                  |
| GET  | `/api/admin/product-categories` | 分类列表（管理） | 管理员 | 过滤与分页参数                          | `{ items: CategoryDoc[]; total }`          |

### 6.2 订单、用户、营销

| 方法 | 路径                     | 说明                   | 认证   | 备注                         |
| ---- | ------------------------ | ---------------------- | ------ | ---------------------------- |
| GET  | `/api/admin/orders`     | 订单列表               | 管理员 | 见上文 Order 模块            |
| PUT  | `/api/admin/orders/:id` | 更新订单状态           | 管理员 | 仅更新 `status`              |
| GET  | `/api/admin/users`      | 用户列表               | 管理员 | 支持按角色/关键字筛选        |
| GET  | `/api/admin/coupons`    | 优惠券列表             | 管理员 | 支持分页/启用状态/关键字筛选 |
| POST | `/api/admin/coupons`    | 新增优惠券             | 管理员 | –                            |
| PUT  | `/api/admin/coupons/:id`| 更新优惠券             | 管理员 | –                            |
| GET  | `/api/admin/ads`        | 广告列表               | 管理员 | 结合 `AdsSearchQuery` 使用   |
| POST | `/api/admin/ads`        | 新增广告               | 管理员 | –                            |
| PUT  | `/api/admin/ads/:id`    | 更新广告               | 管理员 | –                            |

### 6.3 仪表盘与系统配置

| 方法 | 路径                           | 说明             | 认证   | 响应数据类型                 |
| ---- | ------------------------------ | ---------------- | ------ | ---------------------------- |
| GET  | `/api/admin/dashboard/overview` | Dashboard 概览 | 管理员 | `AdminDashboardOverview`    |
| GET  | `/api/admin/system/settings`   | 系统设置         | 管理员 | 运费与支付方式配置           |
| PUT  | `/api/admin/system/settings`   | 更新系统设置     | 管理员 | 同上                         |

相关类型：

- `AdminProductListItem` / `AdminOrderListItem` / `AdminSearchQuery` / `AdsSearchQuery` – `types/admin.ts`
- `AdminDashboardOverview` 及子类型 – `types/api.ts`

---

## 7. 错误处理约定

- 业务错误统一通过 `createApiError` 抛出，并携带 `ApiErrorPayload`：

```ts
interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: any
}
```

- 前端通过 `useApiErrorHandler` 解析：
  - 根据 `code` 进行登录跳转、toast 提示或表单错误展示；
  - 对于网络错误 / 未知错误使用统一兜底文案。

完整错误码列表见：`docs/architecture/errors.md` 与 `types/api.ts` 中的 `ApiErrorCode`。 

# 核心类型与 ApiResponse 约定

本篇文档汇总 NuxtShop 中跨模块复用的核心类型与响应结构，便于在前后端、移动端和测试代码中统一认知。

## 1. ApiResponse 统一响应结构

项目中所有稳定业务接口都使用统一响应结构：

- 在 `types/common.ts` 中定义的通用版本：

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

- 在 `types/global.d.ts` 中还声明了一个全局版本：

```ts
declare interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}
```

实际推荐做法：

- 在 **业务代码与组合式** 中优先 `import type { ApiResponse } from '~/types/common'`；
- 全局声明主要用于老代码或快速原型，不建议在新代码中依赖隐式的 `any` 默认类型。

在接口文档与代码示例中，统一约定：

- 正常返回：`code === 200`；
- 业务错误：抛出 `createApiError`（详见 `docs/architecture/errors.md`），通过 `ApiErrorPayload` 表达；
- 前端通过 `useApiErrorHandler` 统一处理错误，并结合 `error.code` 作路由跳转或 toast 提示。

---

## 2. 用户与认证相关类型

位置：`types/api.ts`。

- `UserPublic` – 前端展示与权限判断使用的用户视图：
  - `_id: string`
  - `username: string`
  - `role: 'admin' | 'user'`
  - 可选的 `name`、`avatar`、`phone`、`language`、`timezone`
  - `isSuperAdmin?`、`twoFactorEnabled?`
- 登录与 2FA：
  - `LoginSuccessResponse` – `{ token, user: UserPublic }`
  - `LoginTwoFactorResponse` – `{ requires2FA: true, userId, maskedPhone?, debugCode? }`
  - `LoginResponse` – 上述二者的联合类型
- 错误：
  - `ApiErrorCode` – 所有标准业务错误码枚举；
  - `ApiErrorPayload` – `{ code, message, details? }`，搭配 `createApiError` 使用。

前端组合式 `useAuth` 与 demo 登录页面均围绕这些类型设计：

- 登录成功后将 `LoginSuccessResponse.token` 写入 `auth-token` Cookie；
- 用户信息通过 `UserPublic` 进行状态管理与权限判断。

---

## 3. 商品与评价类型

### 3.1 商品 Product

位置：`types/product.ts`。

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
  specs?: { label: string; value: string }[]
}
```

用法：

- 前台商品列表与详情页；
- 购物车 `CartItem`（在 `useCart` 中扩展了 `quantity` 字段）；
- 收藏夹与浏览历史（`wishlist.ts`、`history.ts` 中直接持久化 Product 快照）；
- 订单中的 `OrderItem` 与 Product 保持结构兼容，便于复用展示组件。

### 3.2 商品查询与聚合

位置：`server/utils/product.ts`。

- `ProductQueryParams`：
  - `page?`, `limit?`
  - `category?` – 分类 key
  - `query?` – 搜索关键词
  - `sort?` – `'default' | 'price-asc' | 'price-desc' | 'rating-desc'`
- `ProductQueryResult`：
  - `items: DbProduct[]`
  - `total: number`

前台 `/api/products` 与后台 `/api/admin/products` 均基于这些类型构建分页接口。

### 3.3 评价 Review

位置：`types/review.ts`。

- `ReviewDocument` – Mongo 中的评价文档；
- `ReviewSummary` – `{ productId, avgRating, reviewCount }`；
- `ReviewQueryParams` / `ReviewQueryResult` – 列表查询入口。

---

## 4. 订单与仪表盘类型

### 4.1 订单核心类型

位置：`types/api.ts`。

- `OrderStatus` – `'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
- `OrderSummary` – 用于列表：
  - `id`, `total`, `status`, `date`
  - 可选 `discount`, `couponCode`, `couponName`
- `OrderItem` – 与 `Product` 对齐的商品子项；
- `OrderDetail` – 继承 `OrderSummary`，增加：
  - `items: OrderItem[]`
  - `shippingAddress: { name; phone; address }`

服务端存储结构在 `server/utils/order.ts` 中扩展为：

```ts
interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

后台列表项在 `types/admin.ts` 中进一步字符串化时间和 id：

- `AdminOrderListItem` – 将 `_id`/`userId`/时间字段转为字符串，方便通过 API 暴露。

### 4.2 仪表盘统计

位置：`types/api.ts`。

- `AdminDashboardKpi` – 今日订单数、营收、新增用户、待发货/待取消数量；
- `AdminDashboardTrendPoint` / `AdminDashboardUserTrendPoint` – 时间序列数据；
- `AdminDashboardTopProduct` / `AdminDashboardTopCategory` – Top 商品与品类；
- `AdminDashboardTodoItem` / `AdminDashboardOverview` – 管理端 Dashboard 的完整数据结构。

对应接口：`/api/admin/dashboard/overview`。

---

## 5. 地址、优惠券与安全相关类型

### 5.1 地址 Address

位置：`types/address.d.ts`。

```ts
export interface Address {
  _id?: ObjectId
  userId: ObjectId
  name: string
  phone: string
  region: string
  detail: string
  isDefault: boolean
  createdAt: Date
  updatedAt?: Date
}
```

前端在 Profile 相关组件中会定义一个“字符串化版本”（将 `_id`、`userId` 转为字符串），并通过 `ApiResponse<Address[]>` 与接口交互。

### 5.2 优惠券 Coupon

位置：`types/coupon.ts` 与 `server/utils/coupon.ts`。

- `CouponDocument` – Mongo 文档；
- `CouponQueryParams` / `CouponQueryResult` – 后台列表查询；
- `BestCouponResult` – 下单前折扣预览结果（`findBestCouponForAmount`）。

### 5.3 登录历史与 2FA

位置：`types/security.ts`。

- `LoginHistoryStatus` – `'success' | 'failed'`；
- `LoginHistoryDocument` – 登录历史记录；
- `TwoFactorCode` – 二步验证码存储结构。

---

## 6. Admin 端辅助类型

位置：`types/admin.ts`。

- `AdminProductListItem` – 当前等同于 `Product`，用于后台商品列表；
- `AdminOrderListItem` – 见上文订单小节；
- `AdminSearchQuery` – 通用后台列表查询参数：
  - `keyword?`, `field?`, `status?`, `page?`, `limit?`
- `AdsSearchQuery` – 广告管理的查询参数：
  - `position?`, `status?`, `id?`, `altKey?`, `page?`, `limit?`

这些类型主要用于：

- `modules/admin/pages/admin/*` 中 `getFilterParams` 的显式返回类型；
- `/api/admin/*` 接口的查询参数与返回值声明。

---

## 7. 在代码中使用这些类型的推荐方式

- 接口返回值：
  - 服务端：始终返回 `ApiResponse<T>` 或抛出 `createApiError`；
  - 客户端：`http.get<ApiResponse<T>>('/path')`，然后从 `res.data` 中读取实际业务数据。
- 组合式与组件：
  - 在组合式中优先使用 `types/*` 中的共享模型，而不是在局部重新声明相同结构；
  - 对于仅在单个组件内部使用的细节结构，可以在组件内定义局部类型。
- 测试：
  - 单元测试与 E2E 测试均可复用这些类型，以保证测试数据与业务定义保持一致。

如需了解这些类型在实际模块中的具体使用方式，可以配合阅读：

- `docs/architecture/product.md`
- `docs/architecture/order.md`
- `docs/architecture/auth.md`
- `docs/reference/api-overview.md` 

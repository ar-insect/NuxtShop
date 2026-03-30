# Product 模块架构说明

本篇文档介绍 NuxtShop 中商品 (Product) 模块的整体设计，包括：

- 商品数据模型与数据来源；
- 列表页 / 详情页的数据流；
- 分类与搜索、排序的实现；
- 与购物车、评价、浏览历史等其他模块的协作关系。

## 1. 模块职责与位置

- 目录：`modules/product`
- 主要职责：
  - 商品列表展示与分页；
  - 分类筛选与搜索；
  - 商品详情页面（图文详情、评分、推荐信息）；
  - 与购物车、收藏、浏览历史、评价模块的集成。

相关文件：

- 组合式：
  - `modules/product/composables/useProducts.ts` – 商品列表与单个商品的数据访问；
  - `modules/product/composables/useCategoryMapper.ts` – 分类 key → 文案映射。
- 页面：
  - `modules/product/pages/products/index.vue` – 商品列表页；
  - `modules/product/pages/products/[id].vue` – 商品详情页。
- 服务端：
  - `server/utils/product.ts` – 商品在 MongoDB 中的存储与查询；
  - `server/api/products*.ts` – 前台商品列表与详情 API。

## 2. 核心类型与数据来源

### 2.1 TypeScript 模型（Product）

在 `types/product.ts` 中定义了前后端共享的 `Product` 类型：

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

### 2.2 MongoDB 存储与 Seed

`server/utils/product.ts` 负责商品的持久化：

- 集合名：`shop_products_app`；
- 文档类型为 `SeedProduct & { _id?: ObjectId }`；
- 首次访问时通过 `ensureProductsSeeded` 从 `server/data/products.ts` 中写入一批示例商品，包括带富文本 `detailHtml` 的图文描述。

提供的查询函数包括：

- `findAllProducts()` – 返回全部商品；
- `findProductById(id: number)` – 按 id 查单个商品；
- `findProductsWithFilters(params: ProductQueryParams)` – 支持分页、分类、搜索、排序。

其中：

```ts
export interface ProductQueryParams {
  page?: number
  limit?: number
  category?: string
  query?: string
  sort?: 'default' | 'price-asc' | 'price-desc' | 'rating-desc'
}
```

`/api/products` 与 `/api/admin/products` 均基于这些类型构建分页接口，返回值统一包裹在 `ApiResponse<{ items: Product[]; total: number }>` 中。

## 3. 列表页数据流：`/products`

页面文件：`modules/product/pages/products/index.vue`

主要职责：

- 展示商品列表、加载骨架屏；
- 支持搜索、分类筛选、排序；
- 支持 URL 同步（分页、分类、关键词）；
- 为 SEO 设置合适的标题与描述。

数据流概览：

1. 从路由 query 中解析：
   - `page` – 当前页；
   - `category` – 当前分类；
   - `q` – 搜索关键词；
   - `sort` – 排序方式。
2. 使用 `useProducts().getProducts(page, limit, category, query, sort)` 调用 API `/api/products`：
   - 实际请求为 `http.get<ApiResponse<{ items: Product[]; total: number }>>('/products', params)`；
   - 后端使用 `findProductsWithFilters` 访问 MongoDB。
3. 将返回的 `{ items, total }` 映射为：
   - `products` – 商品列表；
   - `total` / `totalPages` – 总数与总页数。
4. 根据筛选条件和总数：
   - 显示骨架屏、商品网格或统一的空态；
   - 使用 `BasePagination` 与 `paginationTo` 工具生成分页链接。

筛选与搜索的 UI 由分类标签 + 搜索框组成，分类 label 通过 `useCategoryMapper` 得到，以便支持中英文与自定义显示文案。

## 4. 详情页数据流：`/products/:id`

页面文件：`modules/product/pages/products/[id].vue`

职责：

- 根据 `id` 加载单个商品；
- 展示图片画廊（缩略图 + 放大镜）；
- 显示价格、评分、富文本描述、分类标签；
- 集成“加入购物车”和“收藏”按钮；
- 展示评价模块和浏览历史。

数据与交互：

- `useProducts().getProductById(id)` 从 `/api/products/:id` API 获取单个商品；
- 评分摘要通过 `/reviews/summary/:id` 请求获取平均评分和评价数；
- 通过 `useHistory` 维护浏览历史列表，在详情页底部展示“最近浏览”；
- “加入购物车”按钮调用 `useCart().addToCart`，未登录则触发登录弹窗；
- “收藏”按钮通过 `useWishlist` 处理收藏逻辑。

详情页中大量使用 i18n 文案与 ARIA 属性，以提升可访问性：

- `sr-only` 标题区块；
- 图片 `alt` 文案；
- `aria-label` 与 `aria-live` 用于错误提示与空态等。

## 5. 与其他模块的协作

Product 模块与多个领域模块协作：

- **Cart**：ProductCard 与详情页中的“加入购物车”按钮使用 `useCart` 将商品加入购物车；
- **Wishlist**：使用 `useWishlist` 切换收藏状态，依赖 Product 的基础字段；
- **Orders**：OrderDetail 中的 `OrderItem` 类型与 Product 结构保持兼容；
- **Reviews**：详情页通过 `/reviews/*` API 集成评价模块；
- **History**：`useHistory` 在详情页中写入浏览记录，从 MongoDB 拉取历史列表。

## 6. 客户端集成要点

- 组合式 `useProducts` 是前端访问商品数据的统一入口：
  - `getProducts(page, limit, category, query, sort)` – 命中 `/api/products`，返回 `{ items, total }` 并更新本地缓存；
  - `getProductById(id)` – 命中 `/api/products/:id`，返回单个 `Product` 或 `undefined`；
- 页面与组件应尽量复用 `Product` 类型，不在局部重新声明结构；
- 与其他模块的协作（购物车、收藏、订单）也都围绕 `Product` 和 `OrderItem` 展开，便于复用组件与逻辑。

## 7. 扩展建议

如需扩展商品模块，可以从以下方向入手：

- 在 `server/data/products.ts` 中增加更多分类与富文本模板；
- 在 `ProductQueryParams` 和 `getProducts` 中加入更多筛选条件（价格区间、是否新品等）；
- 在列表页新增“推荐排序”或个性化排序逻辑；
- 为 Product 增加库存字段，并在下单 / 取消订单时更新库存。

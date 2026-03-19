# Ads 配置与架构说明

本篇文档介绍 NuxtShop 中广告（Ads）模块的整体设计，包括：

- Ads 的数据来源与 MongoDB 模型；
- `/api/ads` 接口的工作方式；
- 如何为首页、收藏页之外的页面扩展新的广告位 (`position`)；
- 与 i18n 和前端组件的协作方式。

## 1. Ads 模块概览

### 1.1 使用场景

当前项目中，广告主要用于：

- 首页 Banner 下方的推荐广告位；
- 收藏页的广告位。

这些广告的内容（图片、跳转链接、文案 key 等）并没有写死在页面组件里，而是存储在 MongoDB 中，以便后续：

- 不修改前端代码即可替换广告内容；
- 按环境（开发 / 测试 / 生产）使用不同的广告数据；
- 为未来的“运营后台 / CMS”预留扩展空间。

### 1.2 主要文件

- API 入口：`server/api/ads.get.ts` → `/api/ads?position=...`
- 类型定义：`types/api.ts` 中的 `AdItem`
- 前端使用场景：
  - 首页组件：`pages/index.vue`
  - 收藏页：`pages/wishlist.vue`
  - 通用展示组件：`components/ui/BaseAdCarousel.vue`

---

## 2. MongoDB 模型与数据结构

Ads 文档在 MongoDB 中通常包含以下字段（示意）：

```ts
interface AdDocument {
  _id: ObjectId
  position: string
  image: string
  link: string
  altKey: string
  createdAt: Date
  updatedAt: Date
}
```

对应的公共类型在 `types/api.ts` 中定义为：

```ts
export interface AdItem {
  id: number
  image: string
  link: string
  altKey: string
}
```

其中：

- `position`：广告位标识，例如：
  - `home-banner`：首页 Banner 下方；
  - `wishlist-sidebar`：收藏页侧边栏；
  - 也可以扩展为 `checkout-sidebar`、`orders-empty` 等；
- `image`：图片地址，通常是相对路径（例如 `/images/ads/...`）或完整 CDN 链接；
- `link`：点击广告后跳转的链接，可以是站内路径或外部 URL；
- `altKey`：用于国际化的文案 key（例如 `home.adElectronics`），在前端通过 i18n 渲染具体文案。

---

## 3. `/api/ads` 接口行为

### 3.1 查询逻辑

`GET /api/ads?position=<position>` 的行为大致为：

1. 从查询参数中读取 `position`（若未指定，可以采用默认位置或返回空列表）；
2. 查询 MongoDB 中 `ads` 集合中该 `position` 对应的文档；
3. 如果集合为空（首次访问或尚未初始化），可以：
   - 自动插入一批示例广告数据（seed）；
   - 再次查询并返回；
4. 按需要对结果进行映射，返回 `AdItem[]` 给前端：

```ts
export interface AdsResponse {
  items: AdItem[]
}
```

### 3.2 错误处理

Ads 模块使用统一的错误封装：

- 使用 `createApiError` 返回结构化错误：

```ts
throw createApiError({
  statusCode: 500,
  code: 'ADDRESS_FETCH_FAILED', // Ads 模块内部可定义自己的错误码
  message: '获取广告失败',
  details: error instanceof Error ? error.message : String(error)
})
```

> 具体错误码和文案可参考 `locales/*` 中的 `error.codes.*` 以及 `types/api.ts` 中的 `ApiErrorCode` 定义。

在前端，`useHttp` 和 `useApiErrorHandler` 会根据错误码与 i18n 配置展示合适的提示信息。

---

## 4. 前端展示与 i18n 协作

### 4.1 组件结构

Ads 一般通过 `BaseAdCarousel` 进行展示：

- 负责轮播 / 指示器 / 基本布局；
- 不关心具体文案，只接收 `AdItem[]` 和若干配置：
  - `image`：图片展示；
  - `link`：点击跳转；
  - `altKey`：通过 `useI18n().t(altKey)` 渲染文案。

示意：

```vue
<BaseAdCarousel :items="ads">
  <!-- 插槽可自定义文案和 CTA -->
</BaseAdCarousel>
```

### 4.2 页面如何使用

以首页为例：

1. 使用 `useAsyncData` 或自定义 composable 从 `/api/ads?position=home-banner` 拉取数据；
2. 将返回的 `items` 传给 `BaseAdCarousel`；
3. 在 `locales/zh-CN.ts` / `en-US.ts` 中为 `altKey` 维护文案：

```ts
// zh-CN
pages: {
  home: {
    adElectronics: '电子产品广告',
    adJewelery: '珠宝广告',
    adMen: '男装广告',
    // ...
  }
}
```

这样就将“广告位的内容”完全数据化和国际化，不需要在组件内硬编码具体文案与图片。

---

## 5. 扩展新的广告位 (position)

要为新页面或场景增加广告位时，可以按以下步骤操作：

### 5.1 设计 position 命名

建议采用 `页面-位置` 的命名方式，例如：

- `checkout-sidebar`：结算页右侧广告位；
- `orders-empty`：订单列表为空状态时的推荐位；
- `profile-bottom`：个人中心底部横幅。

### 5.2 初始化 Mongo 数据

可以通过脚本或首次请求时自动 seed 的方式：

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

确保在 `locales/*` 中增加相应的 `altKey` 文案。

### 5.3 页面中接入

在目标页面中：

1. 通过 `/api/ads?position=checkout-sidebar` 获取广告；
2. 将返回的数据传给 `BaseAdCarousel` 或自定义展示组件；
3. 根据需要调整布局，使广告位与页面内容协调。

---

## 6. 与缓存 / 性能的关系

Ads 数据通常不会频繁变更，可以与以下机制配合使用：

- **Nuxt routeRules + ISR**：为使用 Ads 的页面开启 SWR/定时再生；
- **Nitro/Redis 缓存**：在 Ads API 中增加缓存层，将特定 `position` 的结果短期存入 Redis。

总体原则：

- 业务层只关心「按 position 取广告」；
- 数据层与缓存层可以自由演进，而不影响页面和组件的使用方式。


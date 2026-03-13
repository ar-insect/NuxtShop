# NuxtShop 全栈电商实战模板

本项目是一个基于 Nuxt 3 的全栈电商演示应用，采用现代化的模块化架构。它不仅集成了 MongoDB/Redis 数据持久化、Playwright 自动化测试 (E2E/BDD) 和 Docker 部署方案，还包含了服务端渲染 (SSR)、增量静态再生 (ISR) 等企业级特性，旨在提供一个功能完备、最佳实践的开发参考。

## 🚀 特性

- **模块化架构**: 支持基于 Nuxt Layers (Local Modules) 的业务模块隔离。
- **工具类库**: 内置日期处理、HTTP 请求、表单验证、格式化等常用工具。
- **全局组件**: 封装了弹窗 (Modal)、消息提示 (Toast)、加载 (Loading) 等常用组件。
- **插件系统**: 演示了如何创建和使用全局插件。
- **中间件**: 包含全局路由中间件示例，以及身份验证中间件 (Auth Middleware)。
- **TypeScript**: 完善的类型定义和类型扩展。
- **TSX 支持**: 原生支持使用 TSX/JSX 编写组件。
- **Styled Components**: 集成 `vue3-styled-components` 支持 CSS-in-JS 样式编写。
- **Tailwind CSS**: 集成 Tailwind CSS 进行快速 UI 开发。
- **自动化测试**: 集成 Playwright 框架，支持端到端 (E2E) 测试与基于 Gherkin 的行为驱动开发 (BDD) 测试流程。
- **调试配置**: 预配置 VS Code `launch.json`，支持客户端和服务端断点调试。
- **SSR 支持**: 包含服务端渲染 API 和页面调试示例，支持 `useAsyncData` 数据获取。
- **ISR 渲染**: 配置了增量静态再生 (ISR)，支持页面级缓存策略。
- **数据持久化**: 使用 MongoDB 存储商品、购物车、订单、收藏夹、浏览历史、评价和用户主题偏好等核心数据，并可选集成 Redis 作为缓存与日志存储。
- **功能演示**: 包含完整的商品列表、详情、购物车、订单管理、收藏夹及用户中心功能。

## 📂 目录结构

```bash
├── .vscode/            # VS Code 调试配置
├── assets/             # 静态资源 (CSS, Images)
├── components/         # 全局通用组件 (BaseButton, HomeHero 等)
├── composables/        # 全局组合式函数 (useAuth, useToast 等)
├── content/            # Nuxt Content 内容文件
├── layouts/            # 页面布局
├── middleware/         # 全局路由中间件
├── modules/            # 业务模块 (Domain Driven Design)
│   ├── cart/           # 购物车模块
│   │   ├── components/
│   │   ├── composables/
│   │   ├── pages/
│   │   └── server/api/
│   ├── order/          # 订单模块
│   │   ├── components/
│   │   ├── composables/
│   │   ├── pages/
│   │   └── server/api/
│   ├── product/        # 商品模块
│   │   ├── components/
│   │   ├── composables/
│   │   ├── pages/
│   │   └── server/api/
│   └── user/           # 用户模块
│       ├── middleware/
│       └── ...
├── pages/              # 全局页面路由 (如 index.vue, login.vue)
├── plugins/            # Nuxt 插件
├── public/             # 静态文件
├── scripts/            # 自动化脚本
├── server/             # 全局服务端代码
│   ├── api/            # 通用 API
│   └── utils/          # 服务端工具函数 (mongodb, redis, session 等)
├── tests/              # 测试文件 (E2E/BDD)
├── types/              # 全局类型定义
├── utils/              # 通用工具函数
├── app.vue             # 应用入口
├── nuxt.config.ts      # 项目配置
└── package.json        # 依赖与脚本
```

## 🛠️ 模块化架构详解

本项目采用了领域驱动设计 (DDD) 的思想，将核心业务逻辑拆分为独立的模块。每个模块都包含了自己的组件、组合式函数、页面和服务器端 API，实现了高内聚低耦合。

### 1. 业务模块 (Modules)

- **Product (商品模块)**
  - 路径: `modules/product`
  - 功能: 商品列表展示、商品搜索、商品详情、分类筛选。
  - 关键文件: `useProducts.ts` (数据获取), `useCategoryMapper.ts` (分类映射)。

- **Cart (购物车模块)**
  - 路径: `modules/cart`
  - 功能: 购物车状态管理、添加/删除商品、数量调整、结算流程。
  - 关键文件: `useCart.ts` (状态管理), `checkout.vue` (结算页)。

- **Order (订单模块)**
  - 路径: `modules/order`
  - 功能: 订单创建、订单列表、订单详情、历史记录。
  - 关键文件: `useOrders.ts` (订单逻辑)。

- **User (用户模块)**
  - 路径: `modules/user`
  - 功能: 用户认证中间件、个人中心逻辑。

### 2. 服务端 API 规范 (Server API)

为了避免路由冲突，每个模块的 API 都遵循命名空间规范：

- **Cart API**: `modules/cart/server/api/cart/index.get.ts` -> `/api/cart`
- **Order API**: `modules/order/server/api/orders/index.ts` -> `/api/orders`
- **Product API**: `modules/product/server/api/products/index.get.ts` -> `/api/products`

### 3. 全局共享资源

虽然业务逻辑被拆分到了模块中，但一些通用的资源仍然保留在全局目录中，以便复用：

- **Components**: `components/ui/` (基础 UI 组件), `components/home/` (首页组件)。
- **Composables**: `useAuth` (认证), `useToast` (提示), `useConfirm` (确认框)。
- **Utils**: `http.ts`, `format.ts` 等通用工具。
- **Server Utils**: `server/utils/mongodb.ts` (MongoDB 工具), `server/utils/redis.ts` (Redis 客户端，可选缓存), `server/utils/session.ts` (会话管理)。

### 4. 页面布局 (Layouts)
- **`default`**: 默认布局，包含头部导航和底部版权信息。
- **`auth`**: 认证布局，简洁的居中设计，专用于登录/注册页面。
- **`dashboard`**: 仪表盘布局，包含侧边栏导航，适用于个人中心等管理页面。

### 5. 样式方案
- **Tailwind CSS**: 主要样式工具。
- **Styled Components**: 演示 CSS-in-JS 方案 (`pages/styled-demo.vue`)。

### 6. 渲染策略 (Rendering)
本项目混合使用了多种渲染模式以优化性能：
- **SSR (服务端渲染)**: 默认模式，适用于大多数动态页面。
- **ISR (增量静态再生)**: 通过 `routeRules` 配置缓存策略。
  - `/docs`: SWR (Stale-While-Revalidate)，非阻塞后台更新。
  - `/products/**`: 缓存 1 小时 (3600秒)，适用于商品详情页。

### 7. 数据持久化 (Redis Integration)
本项目中的核心业务数据已全部迁移至 MongoDB。Redis 作为可选组件，主要用于缓存与扩展示例：

- **缓存 / 临时数据**:
  - 可用于实现页面级缓存、限流、会话扩展等（根据业务需要接入）。
- **脚本与示例**:
  - 保留 `server/utils/redis.ts` 作为 Redis 工具封装示例，方便在实际项目中扩展使用。

在默认演示环境下，即使未启动 Redis，核心功能（商品、购物车、订单、收藏、浏览历史、评价等）也可以正常工作。

### 8. 数据持久化 (MongoDB Integration)
本项目集成了 MongoDB 作为核心数据存储，用于持久化所有电商相关业务数据。

- **配置**:
  - `nuxt.config.ts` 中通过 `runtimeConfig` 配置 `MONGODB_URI` 和 `MONGODB_DB_NAME`。
  - 环境变量: 在 `.env` 文件中设置 `MONGODB_URI` (MongoDB 连接字符串) 和 `MONGODB_DB_NAME` (数据库名称)。
- **连接管理**:
  - `server/utils/mongodb.ts`: 封装了 MongoDB 的连接逻辑，确保单例模式，避免重复连接。
  - `server/plugins/mongodb.ts`: Nuxt Nitro 插件，在应用启动时连接 MongoDB，应用关闭时断开连接。
- **CRUD 工具**:
  - `server/utils/mongodb.ts` 中提供了 `find`, `findOne`, `insertOne`, `updateOne`, `deleteOne` 等通用 CRUD 方法，方便在服务端 API 中调用。
- **业务数据持久化(核心集合)**:
  - **商品 (Products)**  
    - 集合: `shop_products_app`  
    - 相关文件: `server/utils/product.ts`, `modules/product/server/api/products/*.ts`  
    - 功能: 商品列表、详情、分页与分类筛选。
  - **购物车 (Carts)**  
    - 集合: `user_carts`  
    - 相关文件: `server/utils/cart.ts`, `modules/cart/server/api/cart/*.ts`  
    - 功能: 登录用户购物车持久化，刷新后与跨端访问保持一致。
  - **订单 (Orders)**  
    - 集合: `user_orders`  
    - 相关文件: `server/utils/order.ts`, `modules/order/server/api/orders/index.ts`  
    - 功能: 订单创建、列表与删除，按用户维度存储。
  - **收藏夹 (Wishlists)**  
    - 集合: `user_wishlists`  
    - 相关文件: `server/utils/wishlist.ts`, `server/api/wishlist*.ts`  
    - 功能: 登录用户收藏商品持久化，以及「最近 7 天收藏最多的商品」统计接口 `/api/wishlist/top-products`。
  - **浏览历史 (Browse History)**  
    - 集合: `browse_history`  
    - 相关文件: `server/utils/history.ts`, `server/api/history/*.ts`  
    - 功能: 最近浏览记录、最近 7 天浏览最多的商品统计接口 `/api/history/top-products`。
  - **商品评价 (Reviews)**  
    - 集合: `product_reviews`  
    - 相关文件: `server/utils/review.ts`, `server/api/reviews/*.ts`  
    - 功能: 商品评价的提交与按商品维度的评价列表展示。
  - **用户主题偏好 (User Preferences)**  
    - 集合: `users` 中的 `preferences` 字段  
    - 相关文件: `server/api/theme.get.ts`, `server/api/theme.post.ts`  
    - 功能: 存储每个用户的主题颜色、圆角、字号等个性化设置。

### 9. 自动化测试

#### 9.1 端到端测试 (Playwright BDD)

本项目集成了 Playwright 和 `playwright-bdd`，支持行为驱动开发：

- **Feature 文件**: `tests/e2e/features/*.feature`
- **Step Definitions**: `tests/e2e/steps/*.steps.ts`
- **运行测试**:
  ```bash
  # 生成 BDD 测试文件并运行
  npx bddgen && npx playwright test
  ```

#### 9.2 单元测试 (Vitest)

项目同时集成了 Vitest + Vue Test Utils，用于组件、组合式函数和工具函数的单元测试。

- **测试框架**: [Vitest](https://vitest.dev/)
- **组件测试环境**: `jsdom` + `@vue/test-utils`
- **覆盖范围示例**：
  - `composables/useAuth`：登录 / 退出登录逻辑，以及重置购物车 / 收藏夹 / 订单等副作用
  - `components/auth/LoginModal.vue`：表单渲染、空值校验、登录成功后关闭弹窗
  - `components/ui/BaseButton.vue`：插槽渲染、点击事件、禁用态行为
  - `components/ui/RegionSelect.vue`：将 v-region 的 `RegionModel` 转换为「省 市 区」字符串
  - `components/ui/BaseDropdown.vue`：基础展开、点击外部关闭行为
  - `utils/http.ts`：`get / post / delete / upload / download` 等 HTTP 封装逻辑

**运行单元测试：**

```bash
npm install          # 首次需要安装依赖
npm run test:unit    # 运行所有单元测试
```

Vitest 配置位于根目录的 `vitest.config.ts`：

- 使用 `environment: 'jsdom'` 以便渲染 Vue 组件
- 配置 `~` 和 `@` 别名指向项目根目录，方便在测试中使用与 Nuxt 一致的导入路径
- 默认会扫描并执行 `tests/unit/**/*.test.ts` 下的测试文件

## 🚢 发布与部署

### 1) 生产构建与启动

```bash
npm install
npm run build
node .output/server/index.mjs
```

- 默认端口：`4000`
- 可通过环境变量覆盖：`PORT=4000 HOST=0.0.0.0`

### 2) 必要环境变量 (Redis，可选)

如果在生产环境中启用了 Redis 作为缓存或扩展功能，需要配置以下环境变量：

- `REDIS_HOST`（默认 `localhost`）
- `REDIS_PORT`（默认 `6379`）
- `REDIS_PASSWORD`（默认空）
- `REDIS_DB`（默认 `0`）

### 3) Docker 部署

本项目提供了 [Dockerfile](file:///Users/mac/Documents/Nuxt3_app/NuxtShop/Dockerfile) 和 [docker-compose.yml](file:///Users/mac/Documents/Nuxt3_app/NuxtShop/docker-compose.yml)：

```bash
docker compose up -d --build
```

- 应用端口映射：`4000:4000`
- Redis 端口映射：`6379:6379`

### 4) PM2 部署 (可选)

项目提供了 [ecosystem.config.js](file:///Users/mac/Documents/Nuxt3_app/NuxtShop/ecosystem.config.js)（cluster 模式）：

```bash
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### 5) 一键打包部署脚本

```bash
npm run deploy
```

会生成 `release.tar.gz`，包含 `ecosystem.config.js`、`package.json` 和 `.output/`。

### 6) ISR / 缓存清理

项目提供了缓存清理脚本 [scripts/clear-cache.sh](file:///Users/mac/Documents/Nuxt3_app/NuxtShop/scripts/clear-cache.sh)（请求 `POST /api/cache/clear`）：

```bash
APP_URL=http://your-domain-or-ip:4000 npm run cache:clear
```

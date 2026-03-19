# NuxtShop 全栈电商实战模板

[![CI](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml/badge.svg)](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml)
  ![Node](https://img.shields.io/badge/node-%3E%3D22.14.0-339933?logo=node.js&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ar-insect/NuxtShop/blob/main/LICENSE)

本项目是一个基于 Nuxt 3 的全栈电商演示应用，采用现代化的模块化架构。它不仅集成了 MongoDB 数据持久化、Playwright 自动化测试 (E2E/BDD) 和 Docker 部署方案，还包含了服务端渲染 (SSR)、增量静态再生 (ISR) 等企业级特性，旨在提供一个功能完备、可阅读、可二次开发的电商最佳实践参考。

> 项目定位：**学习 / 内部脚手架级别的示例电商应用**  
> 适合想要快速了解「Nuxt3 + MongoDB + Playwright + 模块化架构」的开发者。

## 🧰 技术栈概览

- 前端框架：Nuxt 3 (Vue 3, `<script setup>`, Composition API)
- UI 与样式：Tailwind CSS、少量 TSX 组件、Css 变量主题系统
- 数据层：MongoDB（商品 / 购物车 / 订单 / 收藏 / 浏览历史 / 评价 / 地址 / 用户偏好）
- 认证与会话：基于 Cookie 的自定义登录 / 注册流程
- 测试框架：Playwright (E2E + BDD)、Vitest (单元测试)
- 部署与运行：Docker / PM2 / 原生 Node 运行

---

## ⚡ 快速开始

### 1) 克隆项目并安装依赖

```bash
git clone https://github.com/ar-insect/NuxtShop.git
cd NuxtShop

# 推荐使用 pnpm / npm / yarn 三选一
npm install
```

### 2) 准备 MongoDB

- 本地已安装 MongoDB，或使用 Docker：

```bash
docker run -d --name nuxtshop-mongo -p 27017:27017 mongo:6
```

#### 2.1 准备 Redis（推荐）

项目内置了基于 Redis 的**日志缓存**和**页面/接口缓存（配合 ISR）**。  
未启动 Redis 时，核心业务功能（商品 / 购物车 / 订单等）仍可运行，但：

- 日志写入会退化为控制台输出；
- 部分依赖 Redis 的缓存策略会自动降级为实时计算。

建议在本地也启动一个 Redis，体验完整功能：

```bash
docker run -d --name nuxtshop-redis -p 6379:6379 redis:7
```

### 3) 配置环境变量

开发和生产建议使用不同的环境变量配置文件：

```bash
# 开发环境（本地）
cp .env.development.example .env

# 生产环境（服务器）
cp .env.production.example .env.production
```

开发环境的 `.env` 至少需要：

- `MONGODB_URI`：MongoDB 连接字符串（例如：`mongodb://localhost:27017`）
- `MONGODB_DB_NAME`：数据库名称（例如：`nuxtshop`）
- 可选：管理员账号（如果已在 runtimeConfig 中配置）

如果启用了 Redis，还可以配置以下可选变量（不配置则使用默认值）：

- `REDIS_HOST`（默认 `localhost`）
- `REDIS_PORT`（默认 `6379`）
- `REDIS_PASSWORD`（默认空）
- `REDIS_DB`（默认 `0`）

与安全相关的配置建议：

- **MongoDB**
  - 本地开发可以使用默认库名（例如 `nuxtshop_dev`），但测试 / 生产应使用独立实例与数据库（如 `nuxtshop_test` / `nuxtshop_prod`）。
  - 在生产环境中务必启用账号密码与 IP 白名单，避免使用默认用户与弱密码。
- **Redis**
  - 开发环境可以使用无密码的本地 Redis 或直接使用内存存储（当前 `nitro.devStorage` 已默认使用内存）。
  - 生产环境必须配置强密码 `REDIS_PASSWORD`，并将 Redis 部署在内网或私有子网，避免暴露公网端口。
- **管理员账号**
  - `ADMIN_USERNAME` / `ADMIN_PASSWORD` 在 demo 中默认为 `admin` / `123456`，仅用于本地体验。
  - 在生产环境中必须通过 `.env.production` 覆盖为强随机密码，或在初始化后立即修改管理员密码。

### 4) 启动开发服务器

```bash
npm run dev
```

默认打开：http://localhost:3000  
首次启动会自动进行种子数据初始化，并在 MongoDB 中创建商品、用户等基础数据。

### 5) 常用脚本

```bash
npm run dev       # 开发模式
npm run build     # 生产构建
npm run lint      # 代码检查（ESLint）
npm run test:unit # 单元测试（Vitest）
# Playwright E2E / BDD 可按 README 下方测试章节执行
```

---

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
- **数据持久化与缓存**: 使用 MongoDB 存储商品、购物车、订单、收藏夹、浏览历史、评价和用户主题偏好等核心数据，并集成 Redis 用于日志缓存与部分页面/接口缓存（配合 ISR）。
- **功能演示**: 包含完整的商品列表、详情、购物车、订单管理、收藏夹及用户中心功能。

## 🧪 Demos 导航

NuxtShop 同时也是一个技术栈 Demo 集合，主要的示例页面都收敛在 `/demos/*` 路由下，方便你快速了解各项能力：

| 路由               | 分类             | 说明                                                                                           |
|--------------------|------------------|------------------------------------------------------------------------------------------------|
| `/demos/components` | UI / TSX / 样式  | 自研 UI 组件（按钮、输入、选择器、分页、下拉、卡片等），`BaseModal` / `BaseConfirm` / `BaseLoading` 推荐用法，包含 TSX + styled-components 集成示例。 |
| `/demos/pinia`      | 状态管理 (Pinia) | 展示 Pinia 基础用法（计数器）、异步 action 监听 (`$onAction`)，以及用户 Store 的登录 / 更新资料场景。 |
| `/demos/http`       | HTTP 工具        | 演示 `utils/http.ts` 封装：GET/POST 请求、文件上传 / 下载，并结合 toast 做错误反馈。          |
| `/demos/ssr`        | SSR / 数据获取   | 展示 SSR 下的数据获取与调试方式，以及如何在页面中区分服务端 / 客户端逻辑。                    |
| `/demos/plugins`    | Nuxt 插件        | 演示自定义 Nuxt 插件（如 `plugins/test-plugin.ts`）的注入方式，以及在模板 / 脚本中使用全局提供的工具。 |
| `/demos/utils`      | 工具函数         | 汇总常用工具函数的使用示例，方便在实际业务中直接复用。                                        |
| `/demos/types`      | 类型 / 模型      | 演示 `types/*` 中共享类型在 API、组合式与组件之间的协作方式。                                 |
| `/demos/tsx`        | TSX 组件         | 展示 TSX 组件的编写方式以及与现有样式系统的配合。                                             |
| `/demos/styled`     | Styled Components | 使用 `vue3-styled-components` 的示例，包括在 SFC 与 TSX 组件中集成 styled-components。      |
| `/demos/bdd`        | 测试 / BDD       | 基于 Playwright BDD 的测试控制台：动态加载 `.feature` 文件、运行单个或全部用例，并展示测试报告与失败截图。 |

## 🌐 多语言 (i18n)

项目内置了基础的中英双语支持，基于一个轻量级的自定义 i18n 实现：

- **语言包位置**  
  - `locales/zh-CN.ts`：中文文案  
  - `locales/en-US.ts`：英文文案  
  - 统一通过 `ui.*` / `pages.*` / `profile.*` / `demo.*` 等命名空间组织。

- **运行时 Store 与组合式**  
  - `stores/i18n.ts`：管理当前语言 (`locale`) 与持久化（localStorage）。  
  - `composables/useI18n.ts`：提供 `t(key, params?)` 和 `setLocale`，支持占位符（如 `{count}`）替换。

- **默认语言与持久化**  
  - SSR 首屏使用默认语言（当前为中文），避免 Hydration mismatch。  
  - 客户端挂载后根据 localStorage 中的 `nuxtshop-locale` 或浏览器语言自动切换。  
  - 登录用户的语言偏好会持久化到用户文档 `language` 字段，后续可用于 SSR 侧语言选择。

- **切换入口**  
  - 个人中心 → 「偏好设置」中提供语言选择（简体中文 / English），支持：  
    - 更新 Pinia 中的 `locale`；  
    - 写入 localStorage；  
    - （登录状态下）通过 `/api/user/update` 写入用户偏好。

- **覆盖范围示例**  
  - 顶部导航与 Dashboard 布局导航（Home / Profile / Cart / Wishlist 等）。  
  - 登录 / 注册 / 首页 / 商品卡片 / 评价组件。  
  - 个人中心（基本信息 / 收货地址 / 安全设置 / 偏好设置 / 退出登录）。  
  - 通用 UI 组件：`BaseModal` / `BaseConfirm` / `BaseLoading` / `BasePagination` / 验证滑块 / 拼图验证码等。  
  - `components-demo` 页面完整中英文说明。

要新增多语言文案时，建议按现有命名空间在 `locales/*` 中补充 key，然后通过 `useI18n().t('xxx.yyy')` 在组件中使用。

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
- **Server Utils**: `server/utils/mongodb.ts` (MongoDB 工具), `server/utils/redis.ts` (Redis 客户端，用于日志与缓存), `server/utils/session.ts` (会话管理)。

### 4. 页面布局 (Layouts)
- **`default`**: 默认布局，包含头部导航和底部版权信息。
- **`auth`**: 认证布局，简洁的居中设计，专用于登录/注册页面。
- **`dashboard`**: 仪表盘布局，包含侧边栏导航，适用于个人中心等管理页面。

### 5. 样式方案
- **Tailwind CSS**: 主要样式工具。
- **Styled Components**: 演示 CSS-in-JS 方案 (`pages/styled-demo.vue`)。

## 🔍 深入阅读

如果你希望将 NuxtShop 用作团队脚手架或进一步理解底层设计，可以参考以下文档：

- `docs/architecture/auth.md`：认证架构说明，包含当前 demo token 流程、`server/utils/auth.ts` 入口以及如何升级为 JWT / 接入 OAuth 的示例思路。
- `docs/architecture/ads.md`：广告 (Ads) 模块设计，说明广告配置的 MongoDB 模型、`/api/ads` 接口以及如何为不同页面扩展新的 `position`。
- `docs/architecture/errors.md`：错误码与错误处理架构，涵盖 `ApiErrorCode` 类型、`createApiError` 使用规范，以及前端 `useApiErrorHandler` 的处理流程。

### 6. 渲染策略 (Rendering)
本项目混合使用了多种渲染模式以优化性能：
- **SSR (服务端渲染)**: 默认模式，适用于大多数动态页面。
- **ISR (增量静态再生)**: 通过 `routeRules` 配置缓存策略。
  - `/docs`: SWR (Stale-While-Revalidate)，非阻塞后台更新。
  - `/products/**`: 缓存 1 小时 (3600秒)，适用于商品详情页。

### 7. 缓存与日志 (Redis Integration)
本项目中的核心业务数据已全部迁移至 MongoDB。Redis 用于：

- **日志 / 监控**:
  - 记录关键操作日志，支持后续扩展为实时监控或仪表盘。

如需了解认证架构与如何从当前 demo token 升级到 JWT/OAuth，可参考：

- `docs/architecture/auth.md`：说明 token 解析流程、`server/utils/auth.ts` 入口以及推荐的 JWT 配置与安全建议。
- **页面 / 接口缓存**:
  - 与 Nuxt `routeRules` / ISR 配合，对部分页面或接口结果进行短期缓存，减少重复计算。

在默认演示环境下，如果未启动 Redis，核心业务功能（商品、购物车、订单、收藏、浏览历史、评价等）仍然可以正常工作，只是：

- 日志会退化为控制台输出；
- 与 Redis 相关的缓存策略会自动降级为实时查询。

### 日志查看位置

- **控制台 (Console)**  
  - 本地开发时，所有服务端错误、Mongo/Redis 连接日志、缓存清理等信息会输出到启动 Nuxt 的终端中。  
  - `server/plugins/mongodb.ts`、`server/utils/redis.ts`、各 API 中的 `console.error` 主要用于开发调试。

- **Redis 日志列表 (app:logs)**  
  - `server/api/log.post.ts` 提供了一个简单的服务端日志收集接口，会将前端或服务端上报的日志写入 Redis：  
    - Key：`app:logs`（List）  
    - 每条日志是一个 JSON 字符串，包含原始 body、服务器时间戳与 IP。  
  - 可以通过 `redis-cli` 查看最近日志，例如：  

    ```bash
    redis-cli LRANGE app:logs 0 20
    ```

- **MongoDB**  
  - MongoDB 目前主要用于业务数据存储（商品、用户、订单、广告配置等），不直接存储应用日志。  
  - 如需在生产环境中将日志落盘到 MongoDB，可以在参考 `server/api/log.post.ts` 的基础上扩展一个 Mongo 日志写入逻辑。

---

## 🏗 架构总览

从宏观上看，NuxtShop 是一个标准的「前后端一体化」电商应用，数据流大致如下：

```text
浏览器 (pages / components / layouts)
        │
        ▼
Nuxt 服务端渲染层 (server/api + modules/*/server/api)
        │
        ├── MongoDB：商品 / 用户 / 购物车 / 订单 / 收藏 / 评价 / 地址 / 广告配置
        └── Redis：日志缓存 / 页面与接口缓存 (配合 ISR)
```

### 核心模块职责

- **Auth / User（认证 & 用户）**
  - 位置：`composables/useAuth.ts`、`server/api/auth/*`、`modules/user`  
  - 职责：登录 / 注册、`auth-token` Cookie 管理、当前用户状态注入、用户偏好（语言 / 时区）持久化。
  - 服务端统一通过 `server/utils/auth.ts` 解析与校验 token（目前是 `user-jwt-token-<id>` 的简化实现），在未来切换为真实 JWT / OAuth 时，只需替换这一处实现即可。

- **Product（商品）**
  - 位置：`modules/product`  
  - 职责：商品列表、搜索、分类筛选、详情页、评价列表、浏览历史记录等。

- **Cart（购物车）**
  - 位置：`modules/cart`  
  - 职责：本地购物车状态管理、数量增减、删除商品、推荐商品、结算页（收货地址 / 支付方式 / 下单）。

- **Order（订单）**
  - 位置：`modules/order`  
  - 职责：创建订单、订单列表、订单详情、订单状态（待付款 / 处理中 / 已发货 / 已完成 / 已取消）展示。

  - 订单类型与 API 约定：

    | 场景           | 类型                     | 说明                                       |
    |----------------|--------------------------|--------------------------------------------|
    | 列表 API       | `OrderSummary[]`         | `/api/orders` 返回的订单列表摘要           |
    | 详情 API       | `OrderDetail`            | `/api/orders/:id` 返回的订单详情           |
    | 服务端存储结构 | `OrderDocument extends OrderDetail` | `server/utils/order.ts` 中 MongoDB 文档结构，额外包含 `userId`、`createdAt`、`updatedAt` 等服务端字段 |

- **Profile（个人中心）**
  - 位置：`pages/profile.vue`、`components/profile/*`、`modules/user`  
  - 职责：基础信息、头像与昵称、收货地址、密码修改、2FA 示例、登录历史、主题与语言 / 时区偏好等。

- **Ads（广告与配置内容）**
  - 位置：`server/api/ads.get.ts`、`pages/index.vue`、`pages/wishlist.vue`、`components/ui/BaseAdCarousel.vue`  
  - 职责：统一从 MongoDB 读取广告配置（图片 / 跳转链接 / 文案 key），用于首页 Banner 下方广告位、收藏页广告位；支持按 `position` 扩展更多广告位。
  - 架构设计说明：
    - 广告信息（图片 / 链接 / 文案 key）以配置的形式存入 MongoDB 的 `ads` 集合，通过 `/api/ads?position=home|wishlist|...` 读取，不再硬编码在页面中；
    - 这样一方面便于在不同环境（开发 / 测试 / 生产）使用不同广告配置，另一方面也为后续「运营后台 / CMS」预留扩展空间；
    - 默认情况下首次访问某个 `position` 时会自动写入一批示例广告，方便开箱即用，生产环境可直接在 MongoDB 中替换为真实广告数据。

通过这一层次划分，读者可以很容易地找到对应领域的代码，并在此基础上扩展新的业务模块（如优惠券、促销、运营位等）。

---

## 👨‍💻 开发者指南

本节面向希望在 NuxtShop 上二次开发或贡献代码的开发者，给出推荐的开发流程。

### 开发环境要求

- Node.js：`>=22.14.0`  
- 包管理器：npm / pnpm / yarn 均可（本仓库脚本以 npm 为示例）  
- MongoDB：版本 6 或以上  
- 可选：Redis 7+（用于日志与缓存）

### 本地开发流程

1. 克隆并安装依赖（参考「快速开始」）。  
2. 配置 `.env`，保证能连接到本地 MongoDB（以及可选的 Redis）。  
3. 启动开发服务器：

   ```bash
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:3000`，确认首页、登录、商品、购物车和个人中心功能正常。  
5. 修改代码时，建议保持以下节奏：
   - 调整组件 / 页面 → 及时查看浏览器效果；  
   - 涉及服务端逻辑（`server/api/*` 或 `modules/*/server/api/*`）时，注意观察终端日志以及网络请求返回；  
   - 功能完成后运行：

     ```bash
     npm run lint
     npm run test:unit
     ```

### 代码风格与约定

- 使用 TypeScript，尽量为公共 API 和复杂函数补充类型。  
- 统一使用 ESLint 做静态检查，规则配置见根目录配置文件。  
- Vue 组件优先使用 `<script setup>` + Composition API。  
- 在模块内部，保持「UI / composables / server/api」三层结构，避免在页面中写过多业务逻辑。

### 推荐的贡献流程（可选）

如果你打算在公开仓库上提交 PR，可以参考：

1. 从 `main` 分支拉取最新代码。  
2. 新建特性分支，例如：`feat/profile-timezone` 或 `fix/cart-discount-calc`。  
3. 在本地完成开发与自测：`npm run lint && npm run test:unit`。  
4. 提交时使用有意义的 commit message，例如：`feat: add timezone preference to profile`。  
5. 发起 Pull Request，简要说明改动背景与测试结果。

---

## 🤝 贡献指南

欢迎 Issue / PR！如果你希望为 NuxtShop 贡献代码、文档或测试，可以参考：

- 推荐工作流：Fork 仓库 → 创建特性分支 → 本地开发与自测（`npm run lint && npm run test:unit`）→ 提交 PR  
- 代码风格：遵循现有模块划分（UI / composables / server/api），并保持 TypeScript 类型与 API 契约同步更新  
- 更多细节请参见根目录的 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## ⚙ 环境变量说明

下面汇总了项目中常用的环境变量。多数变量已经在 `.env.example` 中给出示例值。

### 核心连接配置

| 变量名            | 必填 | 默认值                 | 说明                                     |
| ----------------- | ---- | ---------------------- | ---------------------------------------- |
| `MONGODB_URI`     | 是   | `mongodb://localhost`  | MongoDB 连接串                           |
| `MONGODB_DB_NAME` | 是   | `nuxtshop`             | MongoDB 数据库名称                       |
| `REDIS_HOST`      | 否   | `localhost`            | Redis 主机名                             |
| `REDIS_PORT`      | 否   | `6379`                 | Redis 端口                               |
| `REDIS_PASSWORD`  | 否   | 空字符串               | Redis 密码（如无可留空）                 |
| `REDIS_DB`        | 否   | `0`                    | Redis 数据库编号                         |

> 提示：即使未配置 Redis，核心业务也能正常运行，相关缓存与日志会自动降级。

### 运行时行为开关

| 变量名                         | 必填 | 默认值                                 | 说明                                                                 |
| ------------------------------ | ---- | -------------------------------------- |---------------------------------------------------------------------- |
| `NUXT_PUBLIC_DISABLE_CAPTCHA` | 否   | dev/test：`1`；prod：`0`（可被覆盖） | 设为 `1` 时在前端禁用验证码组件；未显式配置时开发/测试环境默认关闭，生产环境默认开启 |

### Node / Nuxt 默认变量（常见）

| 变量名     | 说明                                         |
| ---------- | -------------------------------------------- |
| `NODE_ENV` | `development` / `production` / `test` 等环境 |
| `PORT`     | Nuxt 监听端口（默认 3000）                   |

在实际项目中，你可以根据需要扩展更多环境变量（如日志级别、第三方支付/存储配置等），并通过 `runtimeConfig` 或 `process.env` 读取，建议同时更新 `.env.example` 与 README 以保持一致。

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

---

## 🤝 参与贡献

欢迎通过 Issue / PR 一起完善 NuxtShop。如果你准备提 PR，建议遵循以下流程：

1. **Fork 仓库并创建分支**
   - 从 `main` 分支拉一个新的 feature 分支，例如：`feat/cart-discount`、`fix/order-status-badge`。
2. **本地开发与验证**
   - 安装依赖并启动开发环境：
     ```bash
     npm install
     npm run dev
     ```
   - 修改代码后，至少运行：
     ```bash
     npm run lint
     npm run test:unit
     ```
   - 如修改了核心流程（登录、下单、购物车、评价等），建议同时运行 E2E 测试。
3. **代码风格与约定**
   - 使用 TypeScript + `<script setup>`。
   - 业务逻辑优先放在 `modules/*/composables` 和 `server/utils/*` 中，组件尽量保持展示职责。
   - UI 相关优先复用现有的 Base 组件（`BaseButton`、`BaseInput`、`BaseDropdown` 等）。
4. **提交与 PR**
   - Commit 信息保持简洁清晰，推荐使用英文，例如：`feat: add rating-based product sorting`。
   - 在 PR 描述中简单说明：
     - 要解决的问题 / 新增的能力；
     - 涉及的模块与主要文件；
     - 如何验证（手动步骤或测试命令）。

欢迎补充更多测试用例或文档，即使是小的文案修正和注释补充，对项目也很有价值。

---

## 🗺 Roadmap（方向规划）

项目目前已经覆盖了从「浏览 → 加购 → 下单 → 评价 → 用户中心」的完整闭环，后续会围绕以下方向继续演进（也非常欢迎 PR 一起来做）：

- **国际化与可配置文案**
  - 抽离中文文案到 `locales`，支持英文或多语言版本。
  - 提供更易修改的文案配置，用于二次定制。

- **更多电商场景示例**
  - 优惠券 / 满减活动 / 限时折扣等促销流程。
  - 更丰富的订单状态流转（支付中、退款中、部分发货等）。
  - 更完整的售后流程示例（退货 / 换货占位）。

- **后台与运营面板**
  - 简单的管理员后台：商品管理、订单概览、用户概览。
  - 商品统计与看板（销量、浏览量、收藏量等 Mongo 聚合示例）。

- **工程与质量提升**
  - 补充核心模块（Cart / Order / Wishlist / Review）的单测覆盖。
  - 完善 GitHub Actions CI：在 PR 上自动跑 `lint` 和测试。
  - 引入更多 Lint 规则（如对 Vue template 的约束），保持代码风格一致。

- **扩展集成示例**
  - 国际支付 / 第三方登录等“集成型”示例（以 mock/沙箱形式展示）。
  - 外部搜索服务 / 推荐服务的接入占位。

如果你对以上某一块感兴趣，或者有新的想法，可以直接开 Issue 讨论，也可以基于对应方向发起 PR。

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

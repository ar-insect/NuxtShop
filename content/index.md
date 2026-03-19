# NuxtShop 全栈电商实战模板

[English](./README_EN.md) · 简体中文

[![CI](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml/badge.svg)](https://github.com/ar-insect/NuxtShop/actions/workflows/deploy.yml)
![Node](https://img.shields.io/badge/node-%3E%3D22.14.0-339933?logo=node.js&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ar-insect/NuxtShop/blob/main/LICENSE)

本项目是一个基于 Nuxt 3 的全栈电商演示应用，采用现代化的模块化架构。它不仅集成了 MongoDB 数据持久化、Playwright 自动化测试 (E2E/BDD) 和 Docker 部署方案，还包含了服务端渲染 (SSR)、增量静态再生 (ISR) 等企业级特性，旨在提供一个功能完备、可阅读、可二次开发的电商最佳实践参考。

> 项目定位：**学习 / 内部脚手架级别的示例电商应用**\
> 适合想要快速了解「Nuxt3 + MongoDB + Playwright + 模块化架构」的开发者。

## 🧰 技术栈概览

- 前端框架：Nuxt 3 (Vue 3, `<script setup>`, Composition API)
- UI 与样式：Tailwind CSS、少量 TSX 组件、Css 变量主题系统
- 数据层：MongoDB（商品 / 购物车 / 订单 / 收藏 / 浏览历史 / 评价 / 地址 / 用户偏好）
- 认证与会话：基于 Cookie 的自定义登录 / 注册流程
- 测试框架：Playwright (E2E + BDD)、Vitest (单元测试)
- 部署与运行：Docker / PM2 / 原生 Node 运行

***

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

项目内置了基于 Redis 的**日志缓存**和**页面/接口缓存（配合 ISR）**。\
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

默认打开：<http://localhost:4000>\
首次启动会自动进行种子数据初始化，并在 MongoDB 中创建商品、用户等基础数据。

### 5) 常用脚本

```bash
npm run dev       # 开发模式
npm run build     # 生产构建
npm run lint      # 代码检查（ESLint）
npm run test:unit # 单元测试（Vitest）
# Playwright E2E / BDD 可按 README 下方测试章节执行
```

***

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
 - **多语言支持**: 内置中英双语，详见 `docs/architecture/i18n.md`。

## 🧪 Demos 导航

NuxtShop 同时也是一个技术栈 Demo 集合，主要的示例页面都收敛在 `/demos/*` 路由下，方便你快速了解各项能力：

| 路由                  | 分类                | 说明                                                                                                              |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `/demos/components` | UI / TSX / 样式     | 自研 UI 组件（按钮、输入、选择器、分页、下拉、卡片等），`BaseModal` / `BaseConfirm` / `BaseLoading` 推荐用法，包含 TSX + styled-components 集成示例。 |
| `/demos/pinia`      | 状态管理 (Pinia)      | 展示 Pinia 基础用法（计数器）、异步 action 监听 (`$onAction`)，以及用户 Store 的登录 / 更新资料场景。                                          |
| `/demos/http`       | HTTP 工具           | 演示 `utils/http.ts` 封装：GET/POST 请求、文件上传 / 下载，并结合 toast 做错误反馈。                                                    |
| `/demos/ssr`        | SSR / 数据获取        | 展示 SSR 下的数据获取与调试方式，以及如何在页面中区分服务端 / 客户端逻辑。                                                                       |
| `/demos/plugins`    | Nuxt 插件           | 演示自定义 Nuxt 插件（如 `plugins/test-plugin.ts`）的注入方式，以及在模板 / 脚本中使用全局提供的工具。                                            |
| `/demos/utils`      | 工具函数              | 汇总常用工具函数的使用示例，方便在实际业务中直接复用。                                                                                     |
| `/demos/types`      | 类型 / 模型           | 演示 `types/*` 中共享类型在 API、组合式与组件之间的协作方式。                                                                          |
| `/demos/tsx`        | TSX 组件            | 展示 TSX 组件的编写方式以及与现有样式系统的配合。                                                                                     |
| `/demos/styled`     | Styled Components | 使用 `vue3-styled-components` 的示例，包括在 SFC 与 TSX 组件中集成 styled-components。                                          |
| `/demos/bdd`        | 测试 / BDD          | 基于 Playwright BDD 的测试控制台：动态加载 `.feature` 文件、运行单个或全部用例，并展示测试报告与失败截图。                                             |

## 📂 目录结构（简要）

- `components/`：全局通用组件（基础 UI、首页模块等）
- `modules/`：业务模块（商品 / 购物车 / 订单 / 用户）
- `server/`：全局 API 与服务端工具函数
- `tests/`：Playwright E2E / BDD 与 Vitest 单测
- `docs/`：架构文档与参考说明

更详细的目录树与模块职责说明见：`docs/reference/project-structure.md`。

## 🔍 深入阅读

如果你希望将 NuxtShop 用作团队脚手架或进一步理解底层设计，可以参考以下文档：

- `docs/architecture/auth.md`：认证架构说明，包含当前 demo token 流程、`server/utils/auth.ts` 入口以及如何升级为 JWT / 接入 OAuth 的示例思路。
- `docs/architecture/ads.md`：广告 (Ads) 模块设计，说明广告配置的 MongoDB 模型、`/api/ads` 接口以及如何为不同页面扩展新的 `position`。
- `docs/architecture/errors.md`：错误码与错误处理架构，涵盖 `ApiErrorCode` 类型、`createApiError` 使用规范，以及前端 `useApiErrorHandler` 的处理流程。

### Architecture overview

| 领域                  | 文档路径                           | 说明                                                                  |
| ------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Auth & Security     | `docs/architecture/auth.md`    | 当前 demo token 流程、`server/utils/auth.ts` 入口，以及升级 JWT / 接入 OAuth 的建议。 |
| Ads & Configuration | `docs/architecture/ads.md`     | 广告配置在 MongoDB 中的模型、`/api/ads` 接口，以及按 `position` 扩展广告位的方式。           |
| Errors & Handling   | `docs/architecture/errors.md`  | `ApiErrorCode` 列表、`createApiError` 使用规范、前端 `useApiErrorHandler` 流程。 |
| Product             | `docs/architecture/product.md` | 商品模块的数据来源、`useProducts` 结构、列表/详情、历史记录与评价流程说明。                       |
| Cart                | `docs/architecture/cart.md`    | 购物车本地状态 + 持久化 API、推荐商品、结算页与下单流程说明。                                  |
| Order               | `docs/architecture/order.md`   | 订单创建、状态流转、列表/详情页面与 `user_orders` Mongo 模型的完整说明。                     |

### 6. 渲染与缓存 / 日志概览

- 默认使用 SSR 渲染大部分动态页面；
- 通过 `routeRules` 为 `/docs`、`/products/**` 等路由开启 ISR 与缓存策略；
- Redis 用于日志缓存与部分页面 / 接口缓存，未启动 Redis 时策略会自动降级，为本地体验提供无侵入降级路径。

更详细的渲染策略、Redis 配置与日志查看方式见：`docs/architecture/rendering-and-caching.md`。

***

更多关于模块职责、架构细节与开发/发布流程，请参考：

- `docs/architecture/*.md` – 各领域架构文档
- `docs/reference/project-structure.md` – 项目结构与模块说明
- `docs/reference/release-guide.md` – 发布与版本管理建议
- `CONTRIBUTING.md` – 贡献指南与推荐开发流程

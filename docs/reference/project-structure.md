# 项目结构与模块说明

本篇文档总结 NuxtShop 的目录结构和模块划分，便于快速定位代码位置。

## 1. 目录结构总览

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

## 2. 模块化架构 (Modules)

NuxtShop 采用领域驱动设计 (DDD) 的思想，将核心业务逻辑拆分为独立模块。每个模块包含自己的组件、组合式函数、页面和服务器端 API，实现高内聚低耦合。

### 2.1 业务模块

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

### 2.2 服务端 API 规范

为避免路由冲突，每个模块的 API 都遵循命名空间规范：

- Cart API: `modules/cart/server/api/cart/index.get.ts` → `/api/cart`；
- Order API: `modules/order/server/api/orders/index.ts` → `/api/orders`；
- Product API: `modules/product/server/api/products/index.get.ts` → `/api/products`。

### 2.3 全局共享资源

尽管业务逻辑拆分到模块中，一些通用资源仍保留在全局目录，方便复用：

- **Components**: `components/ui/` (基础 UI 组件), `components/home/` (首页组件)；
- **Composables**: `useAuth` (认证), `useToast` (提示), `useConfirm` (确认框) 等；
- **Client utils**: 如 `utils/http.ts`, `utils/format.ts`；
- **Server utils**: 如 `server/utils/mongodb.ts` (Mongo 工具), `server/utils/redis.ts` (Redis 客户端), `server/utils/session.ts` (会话管理)。

### 2.4 布局与样式

- 布局 (`layouts/`)：
  - `default`: 默认布局，顶部导航 + 底部版权；
  - `auth`: 居中简洁布局，用于登录/注册；
  - `dashboard`: 带侧边栏的布局，用于个人中心等管理页面。

- 样式：
  - Tailwind CSS 作为主要样式工具；
  - `vue3-styled-components` 用于演示 CSS‑in‑JS（示例见 `pages/styled-demo.vue`）。


# 渲染策略与缓存 / 日志架构说明

本篇文档介绍 NuxtShop 的渲染模式、Nuxt `routeRules` 下的 ISR 配置，以及 Redis 在日志与缓存中的作用。

## 1. 渲染模式概览

NuxtShop 主要使用两种渲染模式：

- **SSR (Server‑Side Rendering)**  
  - 默认模式，适用于大多数动态页面（如首页、商品列表、个人中心等）。
  - 首屏 HTML 由服务器生成，便于 SEO 和首屏性能保障。

- **ISR (Incremental Static Regeneration)**  
  - 通过 `nuxt.config.ts` 中的 `routeRules` 配置；
  - 为特定路由提供“静态化 + 定时再生成”的效果。

### 1.1 已配置的 ISR 路由

典型配置示例（简化）：

- `/docs`：
  - 使用 SWR (Stale‑While‑Revalidate) 风格；
  - 首次请求生成静态内容，后续请求使用旧内容响应，同时在后台异步再生；
  - 适合文档类页面。

- `/products/**`：
  - 对商品详情页进行 1 小时（3600 秒）缓存；
  - 在缓存期内请求直接使用缓存结果，减少对数据库和外部接口的压力。

> 具体的 `routeRules` 配置可在 `nuxt.config.ts` 中查看。

## 2. Redis 在项目中的角色

项目的业务数据已经全部迁移到 MongoDB。Redis 主要用于：

### 2.1 日志与监控

- 提供一个集中式的日志缓存管道，便于后续扩展为监控面板或告警系统；
- `server/api/log.post.ts` 提供一个简易的日志上报接口，将前端或服务端上报的日志写入 Redis：
  - Key：`app:logs`（List）；
  - 每条日志是 JSON 字符串，包含原始 body、服务器时间戳与 IP 等信息。

查看日志示例：

```bash
redis-cli LRANGE app:logs 0 20
```

### 2.2 页面 / 接口缓存

- 与 Nuxt `routeRules` / ISR 配合，对部分页面或接口结果进行短期缓存；
- 减少热点数据的重复计算和数据库压力；
- 适合商品详情、文档页等读多写少的场景。

### 2.3 未启动 Redis 时的行为

在默认演示环境下，如果没有启动 Redis：

- 核心业务功能（商品、购物车、订单、收藏、浏览历史、评价等）仍然可以正常工作；
- 日志写入退化为控制台输出（`console.log` / `console.error`）；
- 依赖 Redis 的缓存策略会自动降级为实时查询（不做结果缓存）。

## 3. 日志查看入口

### 3.1 控制台 (Console)

- 本地开发时，所有服务端错误、Mongo / Redis 连接信息、缓存清理等日志都会输出到运行 Nuxt 的终端；
- 主要由以下文件中的 `console.log` / `console.error` 打印：
  - `server/plugins/mongodb.ts`；
  - `server/utils/redis.ts`；
  - 各 API 中的错误处理逻辑。

### 3.2 Redis 日志列表 `app:logs`

如前所述，`server/api/log.post.ts` 会将上报的日志写入 Redis：

- Key：`app:logs`（List）；
- 每个元素为一条日志，包含：
  - 原始请求体；
  - 服务器时间戳；
  - 请求来源 IP。

示例查看命令：

```bash
redis-cli LRANGE app:logs 0 20
```

### 3.3 MongoDB

- 当前 MongoDB 主要用于业务数据存储：
  - 商品、用户、购物车、订单、收藏、评价、地址、广告配置等；
- 并不直接用于存储应用日志。

如果在生产环境中需要持久化日志到 MongoDB，可以在参考 `server/api/log.post.ts` 的基础上：

- 为日志创建独立的集合（如 `app_logs`）；
- 将关键字段（级别、来源、message、traceId 等）结构化写入；
- 再配合可视化工具或 BI 报表进行分析。

## 4. 总体数据流回顾

结合渲染与缓存，NuxtShop 的整体数据流可以简单表示为：

```text
浏览器 (pages / components / layouts)
        │
        ▼
Nuxt 服务端渲染层 (server/api + modules/*/server/api)
        │
        ├── MongoDB：商品 / 用户 / 购物车 / 订单 / 收藏 / 评价 / 地址 / 广告配置
        └── Redis：日志缓存 / 页面与接口缓存 (配合 ISR)
```

你可以根据业务需求，在此基础上：

- 为更多页面或接口增加 ISR / 缓存策略；
- 扩展日志上报结构，接入监控系统；
- 或替换 Redis 为其他缓存层（如内存 + 外部日志服务）。


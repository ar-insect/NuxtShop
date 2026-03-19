# 认证架构与从 Demo Token 升级到 JWT/OAuth

本篇文档面向希望将 NuxtShop 从「示例级登录」升级到「生产级认证」的开发者，重点说明：

- 当前 demo 认证方案如何工作；
- 如何将 `user-jwt-token-<id>` 替换为真实 JWT；
- 如何预留与 OAuth / 第三方登录集成的扩展点；
- 与认证相关的 `runtimeConfig` 与环境变量安全建议。

## 1. 当前 Demo 认证方案概览

### 1.1 Token 结构

目前项目使用的是一个非常简化的“伪 token”：

```text
user-jwt-token-<MongoUserId>
```

- 在 `/api/auth/login` 中，当用户名密码校验通过后，会返回上述格式的 token；
- 前端在登录成功后会将 token 写入 `auth-token` Cookie；
- 所有需要登录态的接口，都通过 `server/utils/auth.ts` 来解析和校验 token。

### 1.2 服务端校验入口：`server/utils/auth.ts`

- `getAuthToken(event)`：从 `auth-token` Cookie 或 `Authorization: Bearer ...` 中读取 token；
- `parseUserIdFromToken(token)`：校验前缀 `user-jwt-token-`，并验证 `<id>` 是否是合法的 Mongo ObjectId；
- `requireUserId(event)`：
  - token 缺失 → 抛出 `AUTH_UNAUTHORIZED`；
  - token 无效 → 抛出 `AUTH_INVALID_TOKEN`；
  - 返回合法的 `userId` 字符串；
- `requireUser(event)`：
  - 内部调用 `requireUserId` 获得 `userId`；
  - 从 MongoDB 查找用户，不存在则抛出 `AUTH_USER_NOT_FOUND`；
  - 返回完整用户文档。

所有需要鉴权的 API（地址、主题偏好、购物车持久化、评价等）都只依赖这两个入口函数，因此后续更换 Token 方案时只需要更新这一处实现。

---

## 2. 从 demo token 升级到 JWT

真实项目推荐使用 JWT (JSON Web Token) 或 Session + 数据库的方式来处理登录态。下面以 JWT 为例说明替换步骤。

### 2.1 新增配置：JWT 密钥与过期时间

在环境变量中新增：

- `JWT_SECRET`：用于签发和验证 JWT 的对称密钥（至少 32 个随机字符）；
- 可选：`JWT_EXPIRES_IN`：过期时间，如 `7d` / `1h`。

示例（开发环境）：

```ini
JWT_SECRET="please-change-me-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
```

在 `nuxt.config.ts` 的 `runtimeConfig` 中，可以增加一段（示例）：

```ts
runtimeConfig: {
  // ...
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
}
```

> 注意：**不要**在代码中写死密钥，只通过环境变量注入。

### 2.2 登录接口中签发 JWT

在 `/server/api/auth/login.post.ts` 中，替换掉当前的伪 token 生成逻辑：

```ts
// 当前 demo 行为（示意）：
const token = `user-jwt-token-${user._id}`
```

改为伪代码（示意，不代表项目已引入对应库）：

```ts
// 1. 从 runtimeConfig 读取密钥
const config = useRuntimeConfig()

// 2. 使用你选择的 JWT 库签发 token（如 jsonwebtoken）
const token = jwt.sign(
  {
    sub: String(user._id),
    role: user.role
  },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
)
```

同时前端 `useAuth` 中对 token 的处理不需要改动，只要仍然把后端返回的 token 写入 `auth-token` Cookie 即可。

### 2.3 `requireUserId` 中解析与校验 JWT

`server/utils/auth.ts` 的核心改动是将 `parseUserIdFromToken` 替换为 JWT 验证逻辑。

伪代码示例：

```ts
import jwt from 'jsonwebtoken'

export const parseUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwt.secret) as { sub?: string }

    if (!payload.sub || !ObjectId.isValid(payload.sub)) {
      return null
    }

    return payload.sub
  } catch {
    // 过期 / 签名不合法 / 格式错误等情况统一视为无效 token
    return null
  }
}
```

`requireUserId` 无需改动其余逻辑，它只关心“是否能得到一个合法的用户 ID”，并在失败时抛出 `AUTH_INVALID_TOKEN`，前端通过 `error.code` 走统一的错误处理与跳转。

### 2.4 关于刷新 token 与登出

- **刷新 token**：可以在用户访问受保护接口时，如果发现 JWT 即将过期（例如剩余不到 1 天），在服务端返回一个新的 token 放到响应头或响应体中，由前端更新 Cookie；
- **登出**：当前 demo 直接清空 `auth-token` Cookie 与本地用户状态即可；如果要实现“服务端强制失效”，可以结合：
  - Token 黑名单（Redis 或数据库）；  
  - 或缩短 JWT 有效期，结合刷新 token 机制。

---

## 3. 与 OAuth / 第三方登录的集成思路

如果希望接入 GitHub / Google / 企业内部 SSO 等第三方登录，大致可以按以下思路扩展：

1. 新增第三方登录入口（前端按钮 → `/auth/oauth/<provider>`）；
2. 在服务端实现对应的 OAuth 回调：
   - 使用 provider 提供的 SDK 或 HTTP 接口获取用户信息（email、id 等）；
   - 根据第三方 ID 在本地用户表中查找或创建用户；
   - 为本地用户签发自己的 JWT（同上），写入 `auth-token` Cookie；
3. 之后所有业务接口仍只关心本地的 userId / role，不直接依赖第三方的 token。

这样可以保证：

- 业务层永远只依赖 `requireUser` 提供的“本地用户”；
- 第三方登录只是“如何把用户带进来”的一种方式，而不是遍布全项目的条件分支。

---

## 4. 与认证相关的 runtimeConfig 与安全建议

### 4.1 MongoDB 配置

`nuxt.config.ts`:

```ts
runtimeConfig: {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'nuxtshop'
  },
  // ...
}
```

建议：

- **开发环境**：
  - 可以使用本地 Mongo 实例，库名如 `nuxtshop_dev`；
- **生产 / 测试环境**：
  - 使用独立的 Mongo 实例和数据库，例如：
    - `nuxtshop_test`
    - `nuxtshop_prod`
  - 强烈建议启用账号密码、IP 白名单等安全配置；
  - 避免在生产环境使用默认用户和弱密码。

对应的 `.env.production.example` 中已经给出了示例 URI，请在真实部署时替换为生产库地址与强密码。

### 4.2 Redis 配置

Nitro 与 runtimeConfig 中都使用了 Redis：

```ts
nitro: {
  storage: {
    cache: {
      driver: 'redis',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: Number(process.env.REDIS_DB) || 0,
      base: 'nitro:cache:'
    }
  },
  devStorage: {
    cache: {
      driver: 'memory'
    }
  }
},
runtimeConfig: {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: Number(process.env.REDIS_DB) || 0
  },
  // ...
}
```

建议：

- 开发环境允许使用本地无密码 Redis，或者直接使用内存存储（当前配置已经在 dev 环境走 `devStorage.memory`）；
- 生产环境必须：
  - 配置强密码 `REDIS_PASSWORD`；
  - 根据需要选择独立的 `REDIS_DB`（例如 `0` 用于缓存，`1` 用于日志）；
  - 将 Redis 实例置于内网或私有子网中，避免直接暴露公网端口。

### 4.3 管理员账号配置

`runtimeConfig.admin`：

```ts
runtimeConfig: {
  // ...
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '123456'
  }
}
```

这是为了方便 demo 初始化而提供的“默认管理员”配置，**不适合生产环境**。生产中建议：

- 必须在 `.env.production` 中设置强密码：

  ```ini
  ADMIN_USERNAME="your-admin"
  ADMIN_PASSWORD="a-strong-random-password"
  ```

- 或者在系统初始化后，立即通过用户界面或脚本修改管理员密码；
- 可以考虑在生产部署脚本中加一项检查：如果检测到仍为默认密码，则拒绝启动。

### 4.4 `NUXT_PUBLIC_DISABLE_CAPTCHA` 与登录安全

`runtimeConfig.public.disableCaptcha` 的默认策略是：

- 显式配置 `NUXT_PUBLIC_DISABLE_CAPTCHA` 时：
  - `'1'` → 禁用验证码；
  - `'0'` → 启用验证码；
- 未配置时：
  - `development` / `test`：默认禁用，方便本地调试；
  - `production`：默认启用。

建议：

- 开发环境可以禁用验证码，提高调试效率；
- 生产环境保持验证码启用，防止简单暴力尝试密码；
- 如果后续接入更复杂的风控（如设备指纹、行为验证码），可以在这里统一挂开关。

---

## 5. 小结

通过本篇文档，你可以：

- 清晰了解当前 demo 认证链路（登录 → Cookie → `requireUser`）；
- 在不改动业务 API 的前提下，将「伪 token」替换为标准 JWT；
- 为未来接入 OAuth / SSO 预留了清晰的扩展点；
- 明确哪些环境变量和 `runtimeConfig` 字段与安全相关，以及在开发/测试/生产环境中应如何配置。

如果你计划将 NuxtShop 用作实际项目的脚手架，建议优先完成：

- JWT 或其它可靠认证机制的落地与测试；
- 为生产环境准备独立的 Mongo/Redis 实例与强密码；
- 补充一两条覆盖登录 / 权限校验的端到端测试（Playwright），防止未来重构时误伤认证流程。


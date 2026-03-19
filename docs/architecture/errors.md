# 错误码与错误处理架构说明

本篇文档说明 NuxtShop 中后端错误码、`createApiError` 封装以及前端 `useApiErrorHandler` 的协作方式，帮助你在新增接口或改动现有逻辑时保持一致的错误处理体验。

## 1. 标准错误响应结构

所有通过 `createApiError` 抛出的错误最终都会在 HTTP 响应中体现为统一结构：

```json
{
  "code": "AUTH_INVALID_TOKEN",
  "message": "Invalid token",
  "details": "Optional details"
}
```

其中：

- `code`：标准化的错误码（字符串字面量 union，详见 `types/api.ts`）；
- `message`：默认错误消息，主要用于调试或作为 i18n 的 fallback；
- `details`：可选的附加信息（如内部错误信息、验证失败原因等）。

## 2. 错误码类型：`ApiErrorCode`

在 `types/api.ts` 中定义了所有后端错误码的联合类型：

```ts
export type ApiErrorCode =
  | 'AUTH_MISSING_CREDENTIALS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_REGISTER_MISSING_FIELDS'
  | 'AUTH_REGISTER_PASSWORD_MISMATCH'
  | 'AUTH_REGISTER_PASSWORD_WEAK'
  | 'AUTH_REGISTER_USERNAME_EXISTS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_USER_NOT_FOUND'
  | 'USER_UPDATE_EMPTY'
  | 'USER_UPDATE_FAILED'
  | 'USER_NOT_FOUND'
  | 'ADDRESS_MISSING_FIELDS'
  | 'ADDRESS_INVALID_ID'
  | 'ADDRESS_NOT_FOUND'
  | 'ADDRESS_CREATE_FAILED'
  | 'ADDRESS_UPDATE_FAILED'
  | 'ADDRESS_DELETE_FAILED'
  | 'ADDRESS_SET_DEFAULT_FAILED'
  | 'ADDRESS_FETCH_FAILED'
  | 'REVIEW_MISSING_FIELDS'
  | 'REVIEW_CREATE_FAILED'
  | 'THEME_MISSING_CONFIG'
  | 'THEME_UPDATE_FAILED'
  | 'THEME_FETCH_FAILED'
  | 'CART_SAVE_FAILED'
```

注意：

- 该列表与 `locales/zh-CN.ts` / `en-US.ts` 中 `error.codes.*` 保持一一对应；
- `createApiError` 的 `code` 参数被约束为 `ApiErrorCode`，不能随意拼写新的字符串；
- 新增错误码时，需要同步更新：
  - `types/api.ts` 中的 `ApiErrorCode`；
  - `locales/*` 中的 `error.codes.<NEW_CODE>`；
  - 使用该错误码的 API 实现。

## 3. `createApiError` 的使用规范

定义位置：`server/utils/api-error.ts`

```ts
import type { ApiErrorCode } from '~/types/api'

export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: any
}

interface CreateApiErrorOptions extends ApiErrorPayload {
  statusCode: number
}

export const createApiError = (options: CreateApiErrorOptions) => {
  const { statusCode, code, message, details } = options

  return createError({
    statusCode,
    statusMessage: message,
    data: {
      code,
      message,
      details
    }
  })
}
```

### 3.1 建议用法

在 API Handler 中，根据语义不同分三类处理：

1. **参数校验错误** → 4xx：

```ts
if (!username || !password) {
  throw createApiError({
    statusCode: 400,
    code: 'AUTH_MISSING_CREDENTIALS',
    message: '请输入用户名和密码',
    details: null
  })
}
```

2. **业务前置条件不满足 / 资源不存在** → 4xx：

```ts
if (!user) {
  throw createApiError({
    statusCode: 404,
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    details: null
  })
}
```

3. **内部错误 / Mongo/Redis 异常** → 5xx：

```ts
try {
  // ...
} catch (error) {
  console.error('Error updating user profile:', error)
  throw createApiError({
    statusCode: 500,
    code: 'USER_UPDATE_FAILED',
    message: '更新个人资料失败',
    details: error instanceof Error ? error.message : String(error)
  })
}
```

### 3.2 约定

- `code`：表示错误“类型”，应稳定且与 i18n 文案匹配；
- `message`：默认错误信息，可以是中文或英文，前端会优先用 i18n 文案替换；
- `details`：仅用于调试或日志，不建议直接暴露敏感信息（如数据库连接串、内部栈信息等）。

## 4. 前端错误处理：`useApiErrorHandler`

前端统一错误处理入口为 `composables/useApiErrorHandler.ts`。

关键逻辑（简化）：

```ts
const handleError = (error: unknown) => {
  const e = error as ApiErrorLike
  const status = e?.statusCode
  const code = e?.data?.code as ApiErrorCode | undefined
  const fallbackMessage = e?.data?.message || e?.message || t('demo.components.toast.errorMsg')

  let localized = fallbackMessage
  if (code) {
    const key = `error.codes.${code}`
    const translated = t(key)
    if (translated !== key) {
      localized = translated
    }
  }

  if (code?.startsWith('AUTH_')) {
    toast.error(localized)
    if (status === 401 && code !== 'AUTH_INVALID_CREDENTIALS' && code !== 'AUTH_MISSING_CREDENTIALS') {
      const token = useCookie('auth-token')
      const user = useState('auth-user', () => null)
      token.value = null
      user.value = null
      router.push('/login')
    }
    return
  }

  toast.error(localized)
}
```

### 4.1 文案优先级

`useApiErrorHandler` 的消息选择顺序为：

1. 如果 `error.data.code` 存在且在 i18n 中有 `error.codes.<code>`：
   - 使用 `t('error.codes.<code>')` 作为最终提示文案；
2. 否则：
   - 回退到 `error.data.message`；
   - 再无则使用通用文案 `t('demo.components.toast.errorMsg')`。

这意味着：

- 后端可以继续返回中文/英文 `message` 作为默认文案；
- 一旦在 i18n 中为错误码配置了本地化文本，用户总是看到与当前语言匹配的提示。

### 4.2 Auth 错误特殊处理

对于 `AUTH_` 开头的错误码：

- 一律通过 `toast.error(localized)` 提示；
- 如果 `statusCode === 401` 且错误码不是「凭据错误」类（`AUTH_INVALID_CREDENTIALS` / `AUTH_MISSING_CREDENTIALS`）：
  - 清空 `auth-token` Cookie；
  - 清空 `auth-user` 状态；
  - 重定向到 `/login`。

这样可以统一处理 token 过期、无效等场景，而不会误伤登录时的表单校验错误。

---

## 5. 错误处理整体流程图（文字版）

从接口到用户提示，大致流程如下：

```text
后端 API
  └─ 业务校验 / 数据库操作
      ├─ 正常 → return { code: 200, message, data }
      └─ 异常 → throw createApiError({ statusCode, code, message, details })
            ↓
Nitro / $fetch
  └─ 将 createError 转换为 HTTP 响应：
      - status: statusCode
      - body.data: { code, message, details }
            ↓
utils/http.ts (http.get/post/...)
  └─ 请求失败时抛出带有 error.data 的异常
            ↓
业务组合式 / 页面
  └─ catch(e) → useApiErrorHandler().handleError(e)
            ↓
useApiErrorHandler
  └─ 读取 e.data.code 与 e.data.message
  └─ 优先使用 i18n("error.codes.<code>")，否则 fallback 到 message
  └─ Auth 场景下额外清理登录态并跳转 /login
            ↓
UI 层
  └─ Toast / Message / Router 切换
```

---

## 6. 为新接口设计错误码的建议

当你新增一个 API 时，可以按以下步骤设计错误码：

1. 确定域前缀：
   - 认证相关：`AUTH_...`
   - 用户相关：`USER_...`
   - 地址相关：`ADDRESS_...`
   - 评价相关：`REVIEW_...`
   - 主题偏好：`THEME_...`
   - 购物车：`CART_...`
   - 订单：`ORDER_...`（未来需要时可以新增）
2. 以动宾结构命名错误：
   - `*_MISSING_FIELDS`：缺少必要参数；
   - `*_INVALID_*`：参数格式错误或不合法；
   - `*_NOT_FOUND`：资源不存在；
   - `*_CREATE_FAILED` / `*_UPDATE_FAILED` / `*_DELETE_FAILED`：数据库操作失败；
3. 在 `types/api.ts` 中将新错误码加入 `ApiErrorCode`；
4. 在 `locales/zh-CN.ts` / `en-US.ts` 的 `error.codes` 下添加对应文案；
5. 在 API 中通过 `createApiError` 使用新错误码，并在前端通过 `useApiErrorHandler` 统一处理。

这样可以保证：

- 错误码在全局范围内具有可读性与一致性；
- 前后端对错误语义有统一约定，便于排查问题和改造逻辑；
- 文案可以通过 i18n 灵活切换，而不会影响错误码的稳定性。


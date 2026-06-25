import { readBody } from 'h3'
import { findUserById } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'
import type { LoginSuccessResponse, UserPublic } from '~/types/api'
import { useRuntimeConfig } from '#imports'
import { verifyTwoFactorCode } from '~/server/utils/two-factor'
import { insertLoginHistory } from '~/server/utils/login-history'
import { createAuthSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event): Promise<LoginSuccessResponse> => {
  const body = await readBody<{ userId?: string; code?: string }>(event)
  const userId = body.userId || ''
  const code = (body.code || '').trim()

  if (!userId || !code) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_MISSING_CREDENTIALS',
      message: '缺少用户或验证码',
      details: null
    })
  }

  const user = await findUserById(userId)

  if (!user || !user.password || !user.twoFactorEnabled) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_USER_NOT_FOUND',
      message: '用户不存在或未开启两步验证',
      details: null
    })
  }

  const ok = await verifyTwoFactorCode(userId, code)

  if (!ok) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      message: '验证码错误或已过期',
      details: null
    })
  }

  const config = useRuntimeConfig()
  const isSuperAdmin = user.role === 'admin' && user.username === config.admin.username

  const userPayload: UserPublic = {
    _id: String(user._id),
    username: user.username,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone,
    language: user.language,
    timezone: user.timezone,
    isSuperAdmin,
    twoFactorEnabled: user.twoFactorEnabled
  }

  await insertLoginHistory(event, String(user._id), 'success')
  await createAuthSession(event, String(user._id))

  return {
    user: userPayload
  }
})

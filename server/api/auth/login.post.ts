// server/api/auth/login.post.ts
import { findUserByUsername, verifyPassword } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'
import type { LoginResponse, UserPublic, LoginTwoFactorResponse, LoginSuccessResponse } from '~/types/api'
import { useRuntimeConfig } from '#imports'
import { insertLoginHistory } from '~/server/utils/login-history'
import { createTwoFactorCode, maskPhone } from '~/server/utils/two-factor'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_MISSING_CREDENTIALS',
      message: '请输入用户名和密码',
      details: null
    })
  }

  // 查找用户
  const user = await findUserByUsername(username)

  if (!user || !user.password) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      message: '凭据无效，请重试',
      details: null
    })
  }

  const isPasswordValid = await verifyPassword(password, user.password)

  if (!isPasswordValid) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      message: '凭据无效，请重试',
      details: null
    })
  }

  if (user.twoFactorEnabled && user.phone) {
    const code = await createTwoFactorCode(String(user._id))
    console.log(`[2FA SMS] To ${user.phone}: Your NuxtShop login code is ${code}`)

    const payload: LoginTwoFactorResponse = {
      requires2FA: true,
      userId: String(user._id),
      maskedPhone: maskPhone(user.phone),
      debugCode: process.env.NODE_ENV !== 'production' ? code : undefined
    }

    return payload
  }

  const token = `user-jwt-token-${user._id}`

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

  const payload: LoginSuccessResponse = {
    token,
    user: userPayload
  }

  return payload
})

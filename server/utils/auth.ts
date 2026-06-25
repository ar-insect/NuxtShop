import type { H3Event } from 'h3'
import { findUserById } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'
import { useRuntimeConfig } from '#imports'
import { getAuthSessionUserId } from './auth-session'

export const getOptionalUserId = async (event: H3Event): Promise<string | null> => {
  return await getAuthSessionUserId(event)
}

export const requireUserId = async (event: H3Event): Promise<string> => {
  const userId = await getOptionalUserId(event)

  if (!userId) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_UNAUTHORIZED',
      message: 'Unauthorized',
      details: null
    })
  }

  return userId
}

export const requireUser = async (event: H3Event) => {
  const userId = await requireUserId(event)
  const user = await findUserById(userId)

  if (!user) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_USER_NOT_FOUND',
      message: 'User not found',
      details: null
    })
  }

  return user
}

export const requireAdmin = async (event: H3Event) => {
  const user = await requireUser(event)

  if (user.role !== 'admin') {
    throw createApiError({
      statusCode: 403,
      code: 'AUTH_FORBIDDEN',
      message: 'Forbidden',
      details: null
    })
  }

  return user
}

export const isSuperAdminUser = (user: { role?: string; username?: string }) => {
  const config = useRuntimeConfig()
  const adminUsername = config.admin?.username
  return user.role === 'admin' && !!adminUsername && user.username === adminUsername
}

export const requireSuperAdmin = async (event: H3Event) => {
  const user = await requireAdmin(event)

  if (!isSuperAdminUser(user)) {
    throw createApiError({
      statusCode: 403,
      code: 'AUTH_FORBIDDEN',
      message: '需要超级管理员权限',
      details: null
    })
  }

  return user
}

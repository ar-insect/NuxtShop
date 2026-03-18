import type { H3Event } from 'h3'
import { ObjectId } from 'mongodb'
import { findUserById } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'

const TOKEN_PREFIX = 'user-jwt-token-'

export const getAuthToken = (event: H3Event) => {
  let token = getCookie(event, 'auth-token')

  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  return token || null
}

export const parseUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    return null
  }

  if (!token.startsWith(TOKEN_PREFIX)) {
    return null
  }

  const userId = token.slice(TOKEN_PREFIX.length)
  if (!userId || !ObjectId.isValid(userId)) {
    return null
  }

  return userId
}

export const requireUserId = (event: H3Event): string => {
  const token = getAuthToken(event)

  if (!token) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_UNAUTHORIZED',
      message: 'Unauthorized',
      details: null
    })
  }

  const userId = parseUserIdFromToken(token)

  if (!userId) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid token',
      details: null
    })
  }

  return userId
}

export const requireUser = async (event: H3Event) => {
  const userId = requireUserId(event)
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

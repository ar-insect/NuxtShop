import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, avatar } = body

  const redis = useRedis()
  if (!redis) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Redis service unavailable'
    })
  }

  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  let userId: number | null = null
  if (token.startsWith('mock-jwt-token-')) {
    userId = 1
  } else if (token.startsWith('user-jwt-token-')) {
    const username = token.slice('user-jwt-token-'.length)
    const authData = await redis.get(`user:auth:${username}`)
    if (!authData) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    const record = JSON.parse(authData)
    userId = typeof record?.id === 'number' ? record.id : null
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  try {
    const key = `user:profile:${userId}`
    
    // 获取现有资料并合并更新
    const existingData = await redis.get(key)
    const currentProfile = existingData ? JSON.parse(existingData) : {}

    const newProfile = {
      ...currentProfile,
      ...(name && { name }),
      ...(avatar && { avatar }),
      updatedAt: new Date().toISOString()
    }

    await redis.set(key, JSON.stringify(newProfile))

    return {
      code: 200,
      message: '个人资料更新成功',
      data: newProfile
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新个人资料失败'
    })
  }
})

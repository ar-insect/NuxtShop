import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, avatar } = body

  // 真实项目中应从 session/token 获取 userId
  // 这里为演示方便，写死 userId = 1（管理员用户）
  const userId = 1

  const redis = useRedis()
  if (!redis) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Redis service unavailable'
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
      message: 'Profile updated successfully',
      data: newProfile
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    })
  }
})

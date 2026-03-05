import { v4 as uuidv4 } from 'uuid'
import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }

  // 获取用户信息
  let user = null
  const redis = useRedis()

  if (token.startsWith('user-jwt-token-')) {
    const username = token.replace('user-jwt-token-', '')
    try {
      const authData = await redis.get(`user:auth:${username}`)
      if (authData) {
        const record = JSON.parse(authData)
        user = {
          id: record.id,
          username: record.username,
          name: record.username,
          avatar: record.avatar || `https://ui-avatars.com/api/?name=${record.username}&background=random`
        }
        
        // 尝试获取最新资料
        try {
            const profileData = await redis.get(`user:profile:${user.id}`)
            if (profileData) {
                const profile = JSON.parse(profileData)
                if (profile.name) user.name = profile.name
                if (profile.avatar) user.avatar = profile.avatar
            }
        } catch (e) {
            // ignore
        }
      }
    } catch (e) {
      console.error('Error fetching user:', e)
    }
  } else if (token.startsWith('mock-jwt-token-')) {
    user = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    }
     // 尝试获取最新资料
     try {
        const profileData = await redis.get(`user:profile:${user.id}`)
        if (profileData) {
            const profile = JSON.parse(profileData)
            if (profile.name) user.name = profile.name
            if (profile.avatar) user.avatar = profile.avatar
        }
    } catch (e) {
        // ignore
    }
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户无效'
    })
  }

  const body = await readBody(event)
  const { productId, rating, content } = body

  if (!productId || !rating || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必要参数'
    })
  }

  const review = {
    id: uuidv4(),
    productId,
    userId: user.id,
    username: user.name || user.username,
    userAvatar: user.avatar,
    rating: Number(rating),
    content,
    createdAt: new Date().toISOString()
  }

  try {
    // 将评价存储到 Redis 列表
    // 使用 lpush 将最新评价插入到列表头部
    await redis.lpush(`reviews:product:${productId}`, JSON.stringify(review))
    
    return {
      success: true,
      data: review
    }
  } catch (error) {
    console.error('Redis error adding review:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '评价提交失败，请稍后重试'
    })
  }
})

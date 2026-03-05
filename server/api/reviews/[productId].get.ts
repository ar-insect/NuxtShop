import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const productId = event.context.params?.productId

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  const redis = useRedis()
  
  try {
    // 获取评价列表（获取前 50 条，避免一次性加载太多）
    const reviewsData = await redis.lrange(`reviews:product:${productId}`, 0, 49)
    
    const reviews = reviewsData.map((item) => {
      try {
        return JSON.parse(item)
      } catch (e) {
        return null
      }
    }).filter(Boolean)

    return {
      success: true,
      data: reviews
    }
  } catch (error) {
    console.error('Redis error fetching reviews:', error)
    // 如果 Redis 报错，返回空数组，不阻断页面加载
    return {
      success: true,
      data: []
    }
  }
})

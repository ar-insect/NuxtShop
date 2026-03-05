import { getSessionId } from '../utils/session'

/**
 * 从 Redis 获取用户收藏夹数据。
 * 使用会话 ID 来区分不同用户/会话的收藏夹。
 * 
 * @param {H3Event} event - H3 事件对象
 * @returns {Promise<any[]>} 收藏商品列表
 */
export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)
  const redis = useRedis()
  
  if (!redis) {
    return []
  }

  const wishlistKey = `wishlist:${sessionId}`
  const wishlistData = await redis.get(wishlistKey)

  return wishlistData ? JSON.parse(wishlistData) : []
})

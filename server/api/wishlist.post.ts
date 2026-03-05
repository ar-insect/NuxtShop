import { getSessionId } from '../utils/session'

/**
 * 更新用户收藏夹到 Redis。
 * 使用会话 ID 来区分不同用户/会话的收藏夹。
 * 
 * @param {H3Event} event - H3 事件对象
 * @returns {Promise<{ success: boolean, message?: string }>} 操作结果
 */
export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)
  const body = await readBody(event)
  const redis = useRedis()

  if (!redis) {
    return { success: false, message: 'Redis not available' }
  }

  const wishlistKey = `wishlist:${sessionId}`
  await redis.set(wishlistKey, JSON.stringify(body))

  return { success: true }
})

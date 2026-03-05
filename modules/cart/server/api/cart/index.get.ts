import { getSessionId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)
  const redis = useRedis()
  
  if (!redis) {
    // Redis 不可用时，降级返回空数组
    return []
  }

  const cartKey = `cart:${sessionId}`
  const cartData = await redis.get(cartKey)

  return cartData ? JSON.parse(cartData) : []
})

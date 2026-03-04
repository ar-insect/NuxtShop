import { getSessionId } from '../utils/session'

/**
 * Updates the user's wishlist in Redis.
 * Uses the session ID to identify the user's wishlist.
 * 
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message?: string }>} The result of the operation.
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

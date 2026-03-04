import { getSessionId } from '../utils/session'

/**
 * Retrieves the user's wishlist from Redis.
 * Uses the session ID to identify the user's wishlist.
 * 
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<any[]>} The list of products in the wishlist.
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

import { ObjectId } from 'mongodb'
import { findWishlistByUserId } from '~/server/utils/wishlist'
import { getAuthToken, parseUserIdFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getAuthToken(event)
  const userId = parseUserIdFromToken(token)

  if (!userId) {
    // 未登录用户当前不支持服务端收藏夹
    return []
  }

  try {
    const items = await findWishlistByUserId(new ObjectId(userId))
    return items
  } catch (e) {
    console.error('Failed to fetch wishlist from MongoDB:', e)
    return []
  }
})

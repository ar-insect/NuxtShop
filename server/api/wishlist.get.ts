import { ObjectId } from 'mongodb'
import { findWishlistByUserId } from '~/server/utils/wishlist'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token || !token.startsWith('user-jwt-token-')) {
    // 未登录用户当前不支持服务端收藏夹
    return []
  }

  const userId = token.replace('user-jwt-token-', '')

  if (!ObjectId.isValid(userId)) {
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

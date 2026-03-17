import { ObjectId } from 'mongodb'
import { saveWishlistForUser } from '~/server/utils/wishlist'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token || !token.startsWith('user-jwt-token-')) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }

  const userId = token.replace('user-jwt-token-', '')

  if (!ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const body = await readBody(event)

  try {
    await saveWishlistForUser(new ObjectId(userId), body)
    return { success: true }
  } catch (e) {
    console.error('Failed to save wishlist to MongoDB:', e)
    throw createError({
      statusCode: 500,
      statusMessage: '保存收藏夹失败'
    })
  }
})

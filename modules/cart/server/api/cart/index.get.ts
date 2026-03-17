import { ObjectId } from 'mongodb'
import { findCartByUserId } from '~/server/utils/cart'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token || !token.startsWith('user-jwt-token-')) {
    // 未登录用户目前不支持服务端购物车，前端也会禁用加入购物车按钮
    return []
  }

  const userId = token.replace('user-jwt-token-', '')

  if (!ObjectId.isValid(userId)) {
    return []
  }

  try {
    const items = await findCartByUserId(new ObjectId(userId))
    return items
  } catch (e) {
    console.error('Failed to fetch cart from MongoDB:', e)
    return []
  }
})

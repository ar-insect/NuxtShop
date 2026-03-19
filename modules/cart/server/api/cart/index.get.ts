import { ObjectId } from 'mongodb'
import { findCartByUserId } from '~/server/utils/cart'
import { getAuthToken, parseUserIdFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getAuthToken(event)
  const userId = parseUserIdFromToken(token)

  if (!userId) {
    // 未登录用户目前不支持服务端购物车，前端也会禁用加入购物车按钮
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

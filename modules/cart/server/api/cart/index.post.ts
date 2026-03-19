import { ObjectId } from 'mongodb'
import { saveCartForUser } from '~/server/utils/cart'
import { requireUserId } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)

  const body = await readBody(event)

  try {
    await saveCartForUser(new ObjectId(userId), body)
    return { success: true }
  } catch (e) {
    console.error('Failed to save cart to MongoDB:', e)
    throw createApiError({
      statusCode: 500,
      code: 'CART_SAVE_FAILED',
      message: '保存购物车失败',
      details: e instanceof Error ? e.message : String(e)
    })
  }
})

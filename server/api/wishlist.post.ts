import { ObjectId } from 'mongodb'
import { saveWishlistForUser } from '~/server/utils/wishlist'
import type { ApiResponse } from '~/types/common'
import { requireUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event): Promise<ApiResponse<boolean>> => {
  const uid = requireUserId(event)
  const body = await readBody(event)
  try {
    await saveWishlistForUser(new ObjectId(uid), body)
    return { code: 200, message: 'OK', data: true }
  } catch (e) {
    console.error('Failed to save wishlist to MongoDB:', e)
    throw createError({
      statusCode: 500,
      statusMessage: '保存收藏夹失败'
    })
  }
})

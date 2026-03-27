import { createApiError } from '~/server/utils/api-error'
import { findReviewsByProductId } from '~/server/utils/review'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  const productIdParam = event.context.params?.productId
  const productId = Number(productIdParam)

  if (!productId || Number.isNaN(productId)) {
    throw createApiError({
      statusCode: 400,
      code: 'REVIEW_INVALID_PRODUCT_ID',
      message: '无效的商品 ID',
      details: { productId: productIdParam }
    })
  }

  const reviews = await findReviewsByProductId(productId, 100)

  const response: ApiResponse<{ items: any[] }> = {
    code: 200,
    message: 'OK',
    data: {
      items: reviews.map((r) => ({
        id: r._id?.toString() || '',
        productId: r.productId,
        userId: r.userId.toString(),
        username: r.username,
        userAvatar: r.userAvatar || '',
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt.toISOString()
      }))
    }
  }
  return response
})

import { createApiError } from '~/server/utils/api-error'
import { getReviewSummaryByProductId } from '~/server/utils/review'

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

  const summary = await getReviewSummaryByProductId(productId)

  return {
    success: true,
    data: {
      avgRating: summary.avgRating,
      reviewCount: summary.reviewCount
    }
  }
})


import { getReviewSummaryByProductId } from '~/server/utils/review'

export default defineEventHandler(async (event) => {
  const productIdParam = event.context.params?.productId

  if (!productIdParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  const productId = Number(productIdParam)

  if (!Number.isFinite(productId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product ID'
    })
  }

  try {
    const summary = await getReviewSummaryByProductId(productId)

    return {
      success: true,
      data: summary
    }
  } catch (e) {
    console.error('Failed to fetch review summary:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch review summary'
    })
  }
})


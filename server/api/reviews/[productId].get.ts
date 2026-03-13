import type { ObjectId } from 'mongodb'
import { findReviewsByProductId } from '~/server/utils/review'

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
    const docs = await findReviewsByProductId(productId, 50)
    const reviews = docs.map((r) => ({
      id: r._id?.toHexString() || '',
      productId: r.productId,
      userId: (r.userId as ObjectId).toHexString(),
      username: r.username,
      userAvatar: r.userAvatar,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt.toISOString()
    }))

    return {
      success: true,
      data: reviews
    }
  } catch (error) {
    console.error('Mongo error fetching reviews:', error)
    return {
      success: true,
      data: []
    }
  }
})

// server/api/reviews/add.post.ts
import type { ObjectId } from 'mongodb'
import { readBody } from 'h3'
import { insertReview } from '~/server/utils/review'
import { createApiError } from '~/server/utils/api-error'
import { requireUser } from '~/server/utils/auth'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const body = await readBody(event)
  const { productId, rating, content } = body

  const numericProductId = Number(productId)

  if (!numericProductId || !rating || !content) {
    throw createApiError({
      statusCode: 400,
      code: 'REVIEW_MISSING_FIELDS',
      message: '缺少必要参数',
      details: null
    })
  }

  try {
    const created = await insertReview({
      productId: numericProductId,
      userId: user._id as ObjectId,
      username: user.name || user.username,
      userAvatar: user.avatar,
      rating: Number(rating),
      content,
      createdAt: new Date()
    })

    const response: ApiResponse<{
      id: string
      productId: number
      userId: string
      username: string
      userAvatar?: string
      rating: number
      content: string
      createdAt: string
    }> = {
      code: 200,
      message: 'OK',
      data: {
        id: created._id?.toHexString() || '',
        productId: created.productId,
        userId: (created.userId as ObjectId).toHexString(),
        username: created.username,
        userAvatar: created.userAvatar,
        rating: created.rating,
        content: created.content,
        createdAt: created.createdAt.toISOString()
      }
    }
    return response
  } catch (error) {
    console.error('Mongo error adding review:', error)
    throw createApiError({
      statusCode: 500,
      code: 'REVIEW_CREATE_FAILED',
      message: '评价提交失败，请稍后重试',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

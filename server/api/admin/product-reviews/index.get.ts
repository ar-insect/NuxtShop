import { getQuery } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { findReviewsWithFilters } from '~/server/utils/review'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)

  const page = query.page ? Number(query.page) || 1 : 1
  const limit = query.limit ? Number(query.limit) || 20 : 20
  const productId = query.productId ? Number(query.productId) || 0 : 0
  const rating = query.rating ? Number(query.rating) || 0 : 0
  const keyword = typeof query.keyword === 'string' ? query.keyword : ''

  try {
    const { items, total } = await findReviewsWithFilters({
      page,
      limit,
      productId: productId > 0 ? productId : undefined,
      rating: rating > 0 ? rating : undefined,
      keyword
    })

    const response: ApiResponse<{ items: any[]; total: number }> = {
      code: 200,
      message: 'OK',
      data: {
        items: items.map((r) => ({
          id: r._id?.toString() || '',
          productId: r.productId,
          userId: r.userId.toString(),
          username: r.username,
          userAvatar: r.userAvatar || '',
          rating: r.rating,
          content: r.content,
          createdAt: r.createdAt.toISOString()
        })),
        total
      }
    }
    return response
  } catch (error) {
    throw createApiError({
      statusCode: 500,
      code: 'REVIEW_QUERY_FAILED',
      message: '获取商品评价列表失败',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

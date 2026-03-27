import { getQuery } from 'h3'
import { findTopViewedProducts } from '~/server/utils/history'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const days = query.days ? Number(query.days) : 7
  const limit = query.limit ? Number(query.limit) : 8

  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 8

  try {
    const items = await findTopViewedProducts(safeDays, safeLimit)

    const response: ApiResponse<{ items: { productId: number; product: any; views: number; lastViewedAt: string }[] }> = {
      code: 200,
      message: 'OK',
      data: {
        items: items.map((i) => ({
          productId: i.productId,
          product: i.product,
          views: i.views,
          lastViewedAt: i.lastViewedAt.toISOString()
        }))
      }
    }
    return response
  } catch (e) {
    console.error('Failed to fetch top viewed products:', e)
    const response: ApiResponse<{ items: any[] }> = {
      code: 500,
      message: 'Failed to fetch top viewed products',
      data: { items: [] }
    }
    return response
  }
})

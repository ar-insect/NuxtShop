import { getQuery } from 'h3'
import { findTopFavoritedProducts } from '~/server/utils/wishlist'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const days = query.days ? Number(query.days) : 7
  const limit = query.limit ? Number(query.limit) : 8

  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 8

  try {
    const items = await findTopFavoritedProducts(safeDays, safeLimit)

    const response: ApiResponse<{ items: { productId: number; product: any; favorites: number; lastUpdatedAt: string }[] }> = {
      code: 200,
      message: 'OK',
      data: {
        items: items.map((i) => ({
          productId: i.productId,
          product: i.product,
          favorites: i.favorites,
          lastUpdatedAt: i.lastUpdatedAt.toISOString()
        }))
      }
    }
    return response
  } catch (e) {
    console.error('Failed to fetch top favorited products:', e)
    const response: ApiResponse<{ items: any[] }> = {
      code: 500,
      message: 'Failed to fetch top favorited products',
      data: { items: [] }
    }
    return response
  }
})

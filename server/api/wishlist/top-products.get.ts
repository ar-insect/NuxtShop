import { getQuery } from 'h3'
import { findTopFavoritedProducts } from '~/server/utils/wishlist'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const days = query.days ? Number(query.days) : 7
  const limit = query.limit ? Number(query.limit) : 8

  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 8

  try {
    const items = await findTopFavoritedProducts(safeDays, safeLimit)

    return {
      success: true,
      items: items.map((i) => ({
        productId: i.productId,
        product: i.product,
        favorites: i.favorites,
        lastUpdatedAt: i.lastUpdatedAt.toISOString()
      }))
    }
  } catch (e) {
    console.error('Failed to fetch top favorited products:', e)
    return {
      success: false,
      items: []
    }
  }
})


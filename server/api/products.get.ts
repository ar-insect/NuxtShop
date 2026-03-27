import { getQuery } from 'h3'
import { findProductsWithFilters } from '~/server/utils/product'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page ? Number(query.page) || 1 : 1
  const limit = query.limit ? Number(query.limit) || 16 : 16
  const category = query.category ? String(query.category) : undefined
  const q = query.query ? String(query.query) : undefined
  const sortRaw = query.sort ? String(query.sort) : 'default'
  const allowedSort = ['default', 'price-asc', 'price-desc', 'rating-desc'] as const
  const sort = allowedSort.includes(sortRaw as any) ? (sortRaw as any) : 'default'

  const result = await findProductsWithFilters({
    page,
    limit,
    category,
    query: q,
    sort
  })

  return {
    items: result.items,
    total: result.total
  }
})

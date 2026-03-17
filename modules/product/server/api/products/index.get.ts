import { getQuery } from 'h3'
import { findProductsWithFilters } from '~/server/utils/product'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const page = q.page ? Number(q.page) : 1
  const limit = q.limit ? Number(q.limit) : 16
  const category = typeof q.category === 'string' ? q.category : undefined
  const query = typeof q.query === 'string' ? q.query : undefined
  const sort =
    typeof q.sort === 'string' && ['default', 'price-asc', 'price-desc', 'rating-desc'].includes(q.sort)
      ? (q.sort as 'default' | 'price-asc' | 'price-desc' | 'rating-desc')
      : undefined

  return await findProductsWithFilters({ page, limit, category, query, sort })
})

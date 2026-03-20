import { getQuery } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { getCategoryCollection } from '~/server/utils/product-category'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1
  const limitRaw = query.limit ? Number(query.limit) || 20 : 20
  const limit = Math.min(Math.max(limitRaw, 1), 100)
  const status = query.status ? String(query.status) : 'ALL'

  const collection = getCategoryCollection()
  const filter: Record<string, any> = {}

  if (status === 'ACTIVE') {
    filter.active = true
  } else if (status === 'INACTIVE') {
    filter.active = false
  }

  const skip = (page - 1) * limit

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ order: 1, key: 1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter)
  ])

  return {
    code: 200,
    message: 'OK',
    data: {
      items: docs,
      total
    }
  }
})


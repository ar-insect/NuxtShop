import { getQuery } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'

interface AdminAdDocument {
  id: number
  position: string
  order: number
  active?: boolean
  image: string
  link: string
  altKey: string
}

const COLLECTION_NAME = 'ads'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const position = query.position ? String(query.position) : undefined
  const status = query.status ? String(query.status) : undefined
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1
  const limitRaw = query.limit ? Number(query.limit) || 10 : 10
  const limit = Math.min(Math.max(limitRaw, 1), 100)

  const collection = getCollection<AdminAdDocument>(COLLECTION_NAME)
  const filter: Record<string, any> = {}

  if (position) {
    filter.position = position
  }

  if (status === 'ACTIVE') {
    filter.active = { $ne: false }
  } else if (status === 'INACTIVE') {
    filter.active = false
  }

  const skip = (page - 1) * limit

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ position: 1, order: 1, id: 1 })
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

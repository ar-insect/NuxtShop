import { getQuery } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import type { AdminAdDocument } from '~/types/ad'
import type { ApiResponse } from '~/types/common'

const COLLECTION_NAME = 'ads'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const position = query.position ? String(query.position) : undefined
  const status = query.status ? String(query.status) : undefined
  const id = query.id ? Number(query.id) || undefined : undefined
  const altKey = query.altKey ? String(query.altKey) : undefined
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

  if (typeof id === 'number' && !Number.isNaN(id)) {
    filter.id = id
  }

  if (altKey) {
    filter.altKey = { $regex: altKey, $options: 'i' }
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

  const response: ApiResponse<{ items: AdminAdDocument[]; total: number }> = {
    code: 200,
    message: 'OK',
    data: {
      items: docs,
      total
    }
  }
  return response
})

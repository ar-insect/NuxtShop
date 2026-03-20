import type { H3Event } from 'h3'
import { getQuery, createError } from 'h3'
import type { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { getCollection } from '~/server/utils/mongodb'
import type { OrderDetail, OrderStatus } from '~/types/api'

interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = 'user_orders'

const allowedStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusParam = query.status ? String(query.status) : undefined
  const keyword = query.keyword ? String(query.keyword).trim() : ''
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1
  const limitRaw = query.limit ? Number(query.limit) || 20 : 20
  const limit = Math.min(Math.max(limitRaw, 1), 100)

  let status: OrderStatus | undefined
  if (statusParam) {
    if (!allowedStatuses.includes(statusParam as OrderStatus)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order status'
      })
    }
    status = statusParam as OrderStatus
  }

  const filter: any = {}
  if (status) {
    filter.status = status
  }

  if (keyword) {
    const regex = new RegExp(keyword, 'i')
    filter.$or = [
      { id: regex },
      { 'shippingAddress.name': regex },
      { 'shippingAddress.phone': regex }
    ]
  }

  const collection = getCollection<OrderDocument>(COLLECTION_NAME)

  const skip = (page - 1) * limit

  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter)
  ])

  const items = docs.map((doc) => ({
    ...doc,
    _id: doc._id ? doc._id.toHexString() : undefined,
    userId: doc.userId.toHexString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  }))

  return {
    code: 200,
    message: 'OK',
    data: {
      items,
      total
    }
  }
})

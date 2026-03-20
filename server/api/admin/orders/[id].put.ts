import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import type { OrderDetail, OrderStatus } from '~/types/api'

interface OrderDocument extends OrderDetail {
  userId: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = 'user_orders'

const allowedStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  const body = await readBody<{ status?: OrderStatus }>(event)
  if (!body.status || !allowedStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order status'
    })
  }

  const collection = getCollection<OrderDocument>(COLLECTION_NAME)

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: { status: body.status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  return {
    code: 200,
    message: 'Updated',
    data: {
      id: result.value.id,
      status: result.value.status
    }
  }
})


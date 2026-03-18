import redis from '~/server/utils/redis'
import { getSessionId } from '~/server/utils/session'
import type { OrderDetail } from '~/types/api'

export default defineEventHandler(async (event): Promise<OrderDetail> => {
  const id = event.context.params?.id
  const userId = getSessionId(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  // 获取该用户的全部订单
  const ordersStr = await redis.get(`orders:${userId}`)
  if (!ordersStr) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  const orders = JSON.parse(ordersStr) as OrderDetail[]
  const order = orders.find((o) => o.id === id)

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  return order
})

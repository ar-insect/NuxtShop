import redis from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const userId = 'user-1' // Mock user ID, should be from session

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  // Get all orders for the user
  const ordersStr = await redis.get(`orders:${userId}`)
  if (!ordersStr) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  const orders = JSON.parse(ordersStr)
  const order = orders.find((o: any) => o.id === id)

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  return order
})
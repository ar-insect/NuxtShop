import redis from '~/server/utils/redis'

/**
 * Handles order management (GET, POST, DELETE).
 * Stores order history in Redis associated with a mock user ID.
 * 
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<any>} The result of the operation (list of orders, success status, or new order).
 * @throws {H3Error} 400 Bad Request if order ID is missing for DELETE.
 */
export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    // Get user ID from query or session (mocked for now)
    const userId = 'user-1' 
    const orders = await redis.get(`orders:${userId}`)
    return orders ? JSON.parse(orders) : []
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const userId = 'user-1'
    
    // Get existing orders
    const existingOrdersStr = await redis.get(`orders:${userId}`)
    const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : []
    
    // Add new order
    const newOrders = [body, ...existingOrders]
    
    // Save back to Redis
    await redis.set(`orders:${userId}`, JSON.stringify(newOrders))
    
    return { success: true, order: body }
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const orderId = query.id
    const userId = 'user-1'

    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    const existingOrdersStr = await redis.get(`orders:${userId}`)
    if (!existingOrdersStr) {
      return { success: false, message: 'No orders found' }
    }

    const existingOrders = JSON.parse(existingOrdersStr)
    const newOrders = existingOrders.filter((order: any) => order.id !== orderId)

    await redis.set(`orders:${userId}`, JSON.stringify(newOrders))

    return { success: true }
  }
})

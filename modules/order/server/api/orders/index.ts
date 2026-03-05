import redis from '~/server/utils/redis'
import { getSessionId } from '~/server/utils/session'

/**
 * 订单管理接口（GET/POST/DELETE）。
 * 将订单历史按用户维度存储在 Redis 中。
 * 
 * @param {H3Event} event - H3 事件对象
 * @returns {Promise<any>} 接口返回结果（订单列表 / 成功状态 / 新订单等）
 * @throws {H3Error} 删除订单时若缺少订单 ID 则抛出 400
 */
export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    // 从会话中获取用户标识
    const userId = getSessionId(event)
    const orders = await redis.get(`orders:${userId}`)
    return orders ? JSON.parse(orders) : []
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const userId = getSessionId(event)
    
    // 获取已有订单
    const existingOrdersStr = await redis.get(`orders:${userId}`)
    const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : []
    
    // 将新订单插入到列表头部
    const newOrders = [body, ...existingOrders]
    
    // 写回 Redis
    await redis.set(`orders:${userId}`, JSON.stringify(newOrders))
    
    return { success: true, order: body }
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const orderId = query.id
    const clearAll = query.clear === 'true'
    const userId = getSessionId(event)

    if (clearAll) {
      await redis.del(`orders:${userId}`)
      return { success: true, message: 'All orders cleared' }
    }

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

import { ObjectId } from 'mongodb'
import { findOrdersByUserId, insertOrder, deleteOrderByUser, clearOrdersByUser } from '~/server/utils/order'
import { findBestCouponForAmount } from '~/server/utils/coupon'
import type { OrderSummary, OrderDetail } from '~/types/api'

export default defineEventHandler(async (event) => {
  const method = event.method
  const token = getCookie(event, 'auth-token')

  if (!token || !token.startsWith('user-jwt-token-')) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }

  const userId = token.replace('user-jwt-token-', '')

  if (!ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const userObjectId = new ObjectId(userId)

  if (method === 'GET') {
    try {
      const orders = await findOrdersByUserId(userObjectId)
      const summaries: OrderSummary[] = orders.map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        date: o.date,
        discount: o.discount,
        couponCode: o.couponCode,
        couponName: o.couponName
      }))
      return summaries
    } catch (e) {
      console.error('Failed to fetch orders from MongoDB:', e)
      throw createError({
        statusCode: 500,
        statusMessage: '获取订单失败'
      })
    }
  }

  if (method === 'POST') {
    const body = await readBody<OrderDetail & { discount?: number; couponCode?: string; couponName?: string }>(event)

    try {
      const originalTotal = typeof body.total === 'number' ? body.total : 0
      const { coupon, discount } = await findBestCouponForAmount(originalTotal)
      const finalTotal = Math.max(originalTotal - discount, 0)

      const orderToSave: OrderDetail & {
        discount?: number
        couponCode?: string
        couponName?: string
      } = {
        ...body,
        total: finalTotal,
        discount: discount > 0 ? discount : undefined,
        couponCode: coupon?.code,
        couponName: coupon?.name
      }

      await insertOrder(userObjectId, orderToSave)
      return { success: true, order: orderToSave }
    } catch (e) {
      console.error('Failed to save order to MongoDB:', e)
      throw createError({
        statusCode: 500,
        statusMessage: '创建订单失败'
      })
    }
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const orderId = query.id as string | undefined
    const clearAll = query.clear === 'true'

    if (clearAll) {
      await clearOrdersByUser(userObjectId)
      return { success: true, message: 'All orders cleared' }
    }

    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    const deleted = await deleteOrderByUser(userObjectId, orderId)
    if (!deleted) {
      return { success: false, message: 'Order not found' }
    }

    return { success: true }
  }
})

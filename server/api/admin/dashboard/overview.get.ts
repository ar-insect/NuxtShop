import type { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { getCollection } from '~/server/utils/mongodb'
import type { OrderDetail, AdminDashboardOverview } from '~/types/api'
import type { User } from '~/types/user'

interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const ORDER_COLLECTION = 'user_orders'
const USER_COLLECTION = 'users'

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const subDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const now = new Date()
  const todayStart = startOfDay(now)
  const sevenDaysAgo = subDays(todayStart, 6)

  const orderCollection = getCollection<OrderDocument>(ORDER_COLLECTION)
  const userCollection = getCollection<User>(USER_COLLECTION)

  const [todayOrders, sevenDayOrders, todayNewUsers, pendingShipmentCount, pendingCancelledCount] = await Promise.all([
    orderCollection
      .find({ createdAt: { $gte: todayStart } })
      .toArray(),
    orderCollection
      .find({ createdAt: { $gte: sevenDaysAgo } })
      .toArray(),
    userCollection.countDocuments({ createdAt: { $gte: todayStart } }),
    orderCollection.countDocuments({ status: 'processing' }),
    orderCollection.countDocuments({ status: 'cancelled' })
  ])

  const todayOrderCount = todayOrders.length
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  const trendMap = new Map<string, { orderCount: number; revenue: number }>()

  for (let i = 0; i < 7; i += 1) {
    const date = subDays(todayStart, 6 - i)
    const key = date.toISOString().slice(0, 10)
    trendMap.set(key, { orderCount: 0, revenue: 0 })
  }

  sevenDayOrders.forEach((order) => {
    const key = startOfDay(order.createdAt).toISOString().slice(0, 10)
    const bucket = trendMap.get(key)
    if (!bucket) return
    bucket.orderCount += 1
    bucket.revenue += order.total || 0
  })

  const trend = Array.from(trendMap.entries()).map(([date, value]) => ({
    date,
    orderCount: value.orderCount,
    revenue: Number(value.revenue.toFixed(2))
  }))

  const todos = [
    {
      id: 'pending-shipment',
      type: 'order' as const,
      title: '待发货订单',
      description: '请尽快处理未发货订单',
      createdAt: now.toISOString(),
      link: '/admin/order'
    },
    {
      id: 'cancelled-orders',
      type: 'order' as const,
      title: '已取消订单',
      description: '查看近期取消订单原因',
      createdAt: now.toISOString(),
      link: '/admin/order'
    }
  ]

  const overview: AdminDashboardOverview = {
    kpi: {
      todayOrderCount,
      todayRevenue: Number(todayRevenue.toFixed(2)),
      todayNewUsers,
      pendingShipmentCount,
      pendingCancelledCount
    },
    trend,
    todos
  }

  return {
    code: 200,
    message: 'OK',
    data: overview
  }
})

import { requireAdmin } from '~/server/utils/auth'
import { getCollection } from '~/server/utils/mongodb'
import type {
  AdminDashboardOverview,
  AdminDashboardTopCategory,
  AdminDashboardTopProduct,
  AdminDashboardUserTrendPoint
} from '~/types/api'
import type { User } from '~/types/user'
import type { OrderDocument } from '~/types/order'

const ORDER_COLLECTION = 'user_orders'
const USER_COLLECTION = 'users'

const subDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

const formatDateKeyInTimeZone = (date: Date, timeZone: string): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(date)
}

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const timeZone = admin.timezone || 'Asia/Shanghai'

  const now = new Date()
  const todayKey = formatDateKeyInTimeZone(now, timeZone)
  const sevenDaysAgo = subDays(now, 6)

  const orderCollection = getCollection<OrderDocument>(ORDER_COLLECTION)
  const userCollection = getCollection<User>(USER_COLLECTION)

  const [recentOrders, recentUsers, pendingShipmentCount, pendingCancelledCount] = await Promise.all([
    orderCollection
      .find({ createdAt: { $gte: sevenDaysAgo } })
      .toArray(),
    userCollection
      .find({ createdAt: { $gte: sevenDaysAgo } })
      .toArray(),
    orderCollection.countDocuments({ status: 'processing' }),
    orderCollection.countDocuments({ status: 'cancelled' })
  ])

  let todayOrderCount = 0
  let todayRevenue = 0
  let todayNewUsers = 0

  const trendMap = new Map<string, { orderCount: number; revenue: number }>()
  const userTrendMap = new Map<string, { newUsers: number }>()

  for (let i = 0; i < 7; i += 1) {
    const date = subDays(now, 6 - i)
    const key = formatDateKeyInTimeZone(date, timeZone)
    trendMap.set(key, { orderCount: 0, revenue: 0 })
    userTrendMap.set(key, { newUsers: 0 })
  }

  recentOrders.forEach((order) => {
    const key = formatDateKeyInTimeZone(order.createdAt, timeZone)
    const bucket = trendMap.get(key)
    if (bucket) {
      bucket.orderCount += 1
      bucket.revenue += order.total || 0
    }
    if (key === todayKey) {
      todayOrderCount += 1
      todayRevenue += order.total || 0
    }
  })

  recentUsers.forEach((user) => {
    if (!user.createdAt) return
    const key = formatDateKeyInTimeZone(user.createdAt, timeZone)
    const bucket = userTrendMap.get(key)
    if (bucket) {
      bucket.newUsers += 1
    }
    if (key === todayKey) {
      todayNewUsers += 1
    }
  })

  const trend = Array.from(trendMap.entries()).map(([date, value]) => ({
    date,
    orderCount: value.orderCount,
    revenue: Number(value.revenue.toFixed(2))
  }))

  const userTrend: AdminDashboardUserTrendPoint[] = Array.from(userTrendMap.entries()).map(([date, value]) => ({
    date,
    newUsers: value.newUsers
  }))

  const productStats = new Map<number | string, AdminDashboardTopProduct>()
  const categoryStats = new Map<string, AdminDashboardTopCategory>()

  recentOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.id
      const existingProduct = productStats.get(key)
      const quantity = item.quantity || 0
      const revenue = (item.price || 0) * quantity

      if (existingProduct) {
        existingProduct.orderCount += 1
        existingProduct.totalQuantity += quantity
        existingProduct.totalRevenue += revenue
      } else {
        productStats.set(key, {
          id: key,
          title: item.title,
          image: item.image,
          category: item.category,
          orderCount: 1,
          totalQuantity: quantity,
          totalRevenue: revenue
        })
      }

      if (item.category) {
        const catKey = item.category
        const existingCategory = categoryStats.get(catKey)
        if (existingCategory) {
          existingCategory.orderCount += 1
          existingCategory.totalQuantity += quantity
          existingCategory.totalRevenue += revenue
        } else {
          categoryStats.set(catKey, {
            category: catKey,
            orderCount: 1,
            totalQuantity: quantity,
            totalRevenue: revenue
          })
        }
      }
    })
  })

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalQuantity - a.totalQuantity)
    .slice(0, 5)
    .map(p => ({
      ...p,
      totalRevenue: Number(p.totalRevenue.toFixed(2))
    }))

  const topCategories = Array.from(categoryStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalQuantity - a.totalQuantity)
    .slice(0, 5)
    .map(c => ({
      ...c,
      totalRevenue: Number(c.totalRevenue.toFixed(2))
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
    userTrend,
    topProducts,
    topCategories,
    todos
  }

  return {
    code: 200,
    message: 'OK',
    data: overview
  }
})

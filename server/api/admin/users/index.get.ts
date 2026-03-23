import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import { isSuperAdminUser, requireAdmin } from '~/server/utils/auth'
import type { User } from '~/types/user'
import type { OrderDetail, UserPublic } from '~/types/api'

const COLLECTION_NAME = 'users'
const ORDER_COLLECTION_NAME = 'user_orders'

const mapUserToPublic = (user: User): UserPublic => ({
  _id: String(user._id),
  username: user.username,
  role: user.role,
  name: user.name,
  avatar: user.avatar,
  phone: user.phone,
  language: user.language,
  timezone: user.timezone,
  isSuperAdmin: isSuperAdminUser(user)
})

interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface AdminUsersListResponse {
  items: (UserPublic & { createdAt?: string; orderCount?: number; totalSpent?: number })[]
  total: number
}

export default defineEventHandler(async (event: H3Event) => {
  const adminUser = await requireAdmin(event)
  const query = getQuery(event)
  const role = query.role ? String(query.role) : undefined
  const keyword = query.keyword ? String(query.keyword).toLowerCase() : ''
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1
  const limitRaw = query.limit ? Number(query.limit) || 20 : 20
  const limit = Math.min(Math.max(limitRaw, 1), 100)

  if (role === 'admin' && !isSuperAdminUser(adminUser)) {
    throw createError({
      statusCode: 403,
      statusMessage: '需要超级管理员权限'
    })
  }

  const collection = getCollection<User>(COLLECTION_NAME)

  const filter: Record<string, any> = {}
  if (role === 'admin' || role === 'user') {
    filter.role = role
  }

  if (keyword) {
    const regex = new RegExp(keyword, 'i')
    filter.$or = [
      { username: regex },
      { name: regex },
      { phone: regex }
    ]
  }

  const skip = (page - 1) * limit

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter)
  ])

  const userIds = docs
    .map(user => user._id)
    .filter((id): id is ObjectId => !!id)

  const orderStatsMap = new Map<string, { orderCount: number; totalSpent: number }>()

  if (userIds.length > 0) {
    const orderCollection = getCollection<OrderDocument>(ORDER_COLLECTION_NAME)
    const stats = await orderCollection
      .aggregate<{ _id: ObjectId; orderCount: number; totalSpent: number }>([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$total' }
          }
        }
      ])
      .toArray()

    for (const stat of stats) {
      orderStatsMap.set(stat._id.toHexString(), {
        orderCount: stat.orderCount,
        totalSpent: stat.totalSpent
      })
    }
  }

  const items = docs.map((user) => {
    const base = mapUserToPublic(user)
    const stats = user._id ? orderStatsMap.get(user._id.toHexString()) : undefined
    return {
      ...base,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
      orderCount: stats?.orderCount ?? 0,
      totalSpent: stats?.totalSpent ?? 0
    }
  })

  return {
    code: 200,
    message: 'OK',
    data: {
      items,
      total
    }
  }
}
)

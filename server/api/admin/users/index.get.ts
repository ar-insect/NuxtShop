import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import type { User } from '~/types/user'
import type { UserPublic } from '~/types/api'

const COLLECTION_NAME = 'users'

const mapUserToPublic = (user: User): UserPublic => ({
  _id: String(user._id),
  username: user.username,
  role: user.role,
  name: user.name,
  avatar: user.avatar,
  phone: user.phone,
  language: user.language,
  timezone: user.timezone
})

export interface AdminUsersListResponse {
  items: (UserPublic & { createdAt?: string })[]
  total: number
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const role = query.role ? String(query.role) : undefined
  const keyword = query.keyword ? String(query.keyword).toLowerCase() : ''
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1
  const limitRaw = query.limit ? Number(query.limit) || 20 : 20
  const limit = Math.min(Math.max(limitRaw, 1), 100)

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

  const items = docs.map((user) => {
    const base = mapUserToPublic(user)
    return {
      ...base,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined
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

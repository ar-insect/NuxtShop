import type { H3Event } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import type { User } from '~/types/user'
import type { UserPublic } from '~/types/api'
import bcrypt from 'bcryptjs'

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

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const body = await readBody<{
    username?: string
    password?: string
    role?: 'admin' | 'user'
    name?: string
    phone?: string
  }>(event)

  if (!body.username || !body.password || !body.role) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_MISSING_FIELDS',
      message: '缺少必填字段',
      details: {
        username: body.username,
        role: body.role
      }
    })
  }

  if (!['admin', 'user'].includes(body.role)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_MISSING_FIELDS',
      message: '角色不合法',
      details: { role: body.role }
    })
  }

  const collection = getCollection<User>(COLLECTION_NAME)

  const existing = await collection.findOne({ username: body.username })
  if (existing) {
    throw createApiError({
      statusCode: 409,
      code: 'ADMIN_USER_USERNAME_EXISTS',
      message: '用户名已存在',
      details: { username: body.username }
    })
  }

  const hashedPassword = await bcrypt.hash(body.password, 10)
  const now = new Date()

  const doc: User = {
    username: body.username,
    password: hashedPassword,
    role: body.role,
    name: body.name || body.username,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.username)}`,
    phone: body.phone,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)

  const created: User = { ...doc, _id: result.insertedId }

  return {
    code: 200,
    message: 'Created',
    data: mapUserToPublic(created)
  }
})

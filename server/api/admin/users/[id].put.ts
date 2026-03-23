import type { H3Event } from 'h3'
import { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import { isSuperAdminUser, requireAdmin } from '~/server/utils/auth'
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
  timezone: user.timezone,
  isSuperAdmin: isSuperAdminUser(user)
})

export default defineEventHandler(async (event: H3Event) => {
  const adminUser = await requireAdmin(event)

  const idParam = event.context.params?.id
  if (!idParam || !ObjectId.isValid(idParam)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_INVALID_ID',
      message: '无效的用户 ID',
      details: { id: idParam }
    })
  }

  const body = await readBody<Partial<{
    role: 'admin' | 'user'
    name: string
    phone: string
    language: 'zh-CN' | 'en-US'
    timezone: string
    password: string
  }>>(event)

  const collection = getCollection<User>(COLLECTION_NAME)

  const target = await collection.findOne({ _id: new ObjectId(idParam) })

  if (!target) {
    throw createApiError({
      statusCode: 404,
      code: 'ADMIN_USER_NOT_FOUND',
      message: '用户不存在',
      details: { id: idParam }
    })
  }

  const updates: Partial<User> = {}
  if (body.role && (body.role === 'admin' || body.role === 'user')) {
    updates.role = body.role
  }
  if (body.name !== undefined) updates.name = body.name
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.language !== undefined) updates.language = body.language
  if (body.timezone !== undefined) updates.timezone = body.timezone

  if (body.password !== undefined) {
    if (!body.password || body.password.length < 6) {
      throw createApiError({
        statusCode: 400,
        code: 'ADMIN_USER_OPERATION_FAILED',
        message: '密码长度至少为 6 位',
        details: null
      })
    }
    updates.password = await bcrypt.hash(body.password, 10)
  }

  if (Object.keys(updates).length === 0) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_OPERATION_FAILED',
      message: '没有可更新的字段',
      details: null
    })
  }

  if ((target.role === 'admin' || updates.role === 'admin') && !isSuperAdminUser(adminUser)) {
    throw createApiError({
      statusCode: 403,
      code: 'AUTH_FORBIDDEN',
      message: '只有超级管理员可以修改管理员账号',
      details: { id: idParam }
    })
  }

  // 防止把自己降级成非 admin（否则后续无法使用后台）
  if (String(adminUser._id) === idParam && updates.role && updates.role !== 'admin') {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_OPERATION_FAILED',
      message: '不能修改自己的管理员角色',
      details: { id: idParam }
    })
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(idParam) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result.value) {
    throw createApiError({
      statusCode: 404,
      code: 'ADMIN_USER_NOT_FOUND',
      message: '用户不存在',
      details: { id: idParam }
    })
  }

  return {
    code: 200,
    message: 'Updated',
    data: mapUserToPublic(result.value)
  }
})

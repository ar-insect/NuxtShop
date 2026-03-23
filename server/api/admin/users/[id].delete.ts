import type { H3Event } from 'h3'
import { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import { isSuperAdminUser, requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import type { User } from '~/types/user'

const COLLECTION_NAME = 'users'

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

  // 不允许删除自己
  if (String(adminUser._id) === idParam) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_OPERATION_FAILED',
      message: '不能删除当前登录的管理员',
      details: { id: idParam }
    })
  }

  if (target.role === 'admin' && !isSuperAdminUser(adminUser)) {
    throw createApiError({
      statusCode: 403,
      code: 'AUTH_FORBIDDEN',
      message: '只有超级管理员可以删除管理员账号',
      details: { id: idParam }
    })
  }

  await collection.deleteOne({ _id: new ObjectId(idParam) })

  return {
    code: 200,
    message: 'Deleted'
  }
})

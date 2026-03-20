import type { H3Event } from 'h3'
import { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
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

  // 不允许删除自己
  if (String(adminUser._id) === idParam) {
    throw createApiError({
      statusCode: 400,
      code: 'ADMIN_USER_OPERATION_FAILED',
      message: '不能删除当前登录的管理员',
      details: { id: idParam }
    })
  }

  const result = await collection.deleteOne({ _id: new ObjectId(idParam) })

  if (result.deletedCount === 0) {
    throw createApiError({
      statusCode: 404,
      code: 'ADMIN_USER_NOT_FOUND',
      message: '用户不存在',
      details: { id: idParam }
    })
  }

  return {
    code: 200,
    message: 'Deleted'
  }
})


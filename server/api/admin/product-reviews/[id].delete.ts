import { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { deleteReviewById } from '~/server/utils/review'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = event.context.params?.id
  if (!idParam || !ObjectId.isValid(idParam)) {
    throw createApiError({
      statusCode: 400,
      code: 'REVIEW_NOT_FOUND',
      message: '无效的评价 ID',
      details: { id: idParam }
    })
  }

  const ok = await deleteReviewById(new ObjectId(idParam))

  if (!ok) {
    throw createApiError({
      statusCode: 404,
      code: 'REVIEW_NOT_FOUND',
      message: '评价不存在或已删除',
      details: { id: idParam }
    })
  }

  return {
    code: 200,
    message: 'Deleted'
  }
})


import { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { deleteCategory } from '~/server/utils/product-category'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = event.context.params?.id
  if (!idParam || !ObjectId.isValid(idParam)) {
    throw createApiError({
      statusCode: 400,
      code: 'PRODUCT_CATEGORY_INVALID_ID',
      message: '无效的分类 ID',
      details: {
        id: idParam
      }
    })
  }

  const ok = await deleteCategory(new ObjectId(idParam))

  if (!ok) {
    throw createApiError({
      statusCode: 404,
      code: 'PRODUCT_CATEGORY_NOT_FOUND',
      message: '分类不存在',
      details: {
        id: idParam
      }
    })
  }

  return {
    code: 200,
    message: 'Deleted'
  }
})


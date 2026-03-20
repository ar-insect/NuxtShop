import { readBody } from 'h3'
import { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { updateCategory } from '~/server/utils/product-category'

interface AdminCategoryUpdatePayload {
  label?: string
  parentKey?: string
  order?: number
  active?: boolean
  description?: string
}

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

  const body = await readBody<AdminCategoryUpdatePayload>(event)

  const patch: AdminCategoryUpdatePayload = {}

  if (body.label !== undefined) patch.label = body.label
  if (body.parentKey !== undefined) patch.parentKey = body.parentKey
  if (body.order !== undefined) patch.order = body.order
  if (body.active !== undefined) patch.active = body.active
  if (body.description !== undefined) patch.description = body.description

  if (Object.keys(patch).length === 0) {
    throw createApiError({
      statusCode: 400,
      code: 'PRODUCT_CATEGORY_MISSING_FIELDS',
      message: '没有可更新的字段',
      details: null
    })
  }

  const updated = await updateCategory(new ObjectId(idParam), patch)

  if (!updated) {
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
    message: 'Updated',
    data: updated
  }
})


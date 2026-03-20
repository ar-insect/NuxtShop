import { readBody } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { createCategory } from '~/server/utils/product-category'

interface AdminCategoryPayload {
  key?: string
  label?: string
  parentKey?: string
  order?: number
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<AdminCategoryPayload>(event)

  if (!body.key || !body.label) {
    throw createApiError({
      statusCode: 400,
      code: 'PRODUCT_CATEGORY_MISSING_FIELDS',
      message: '缺少必填字段',
      details: {
        key: body.key,
        label: body.label
      }
    })
  }

  const created = await createCategory({
    key: body.key,
    label: body.label,
    parentKey: body.parentKey,
    order: body.order
  })

  if (!created) {
    throw createApiError({
      statusCode: 409,
      code: 'PRODUCT_CATEGORY_KEY_EXISTS',
      message: '分类 key 已存在',
      details: {
        key: body.key
      }
    })
  }

  return {
    code: 200,
    message: 'Created',
    data: created
  }
})


import { createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { deleteProduct } from '~/server/utils/product'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = event.context.params?.id
  const id = Number(idParam)

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: '无效的商品 ID',
      data: {
        code: 'ADDRESS_INVALID_ID',
        message: '无效的商品 ID',
        details: {
          id: idParam
        }
      }
    })
  }

  const ok = await deleteProduct(id)

  if (!ok) {
    throw createError({
      statusCode: 404,
      statusMessage: '商品不存在',
      data: {
        code: 'USER_NOT_FOUND',
        message: '商品不存在',
        details: {
          id
        }
      }
    })
  }

  return {
    code: 200,
    message: 'Deleted'
  }
})


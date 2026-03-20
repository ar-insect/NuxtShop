import { readBody, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { updateProduct } from '~/server/utils/product'

interface AdminProductUpdatePayload {
  title?: string
  price?: number
  description?: string
  detailHtml?: string
  category?: string
  image?: string
  images?: string[]
}

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

  const body = await readBody<AdminProductUpdatePayload>(event)

  const patch: AdminProductUpdatePayload = {}
  if (body.title !== undefined) patch.title = body.title
  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '价格不合法',
        data: {
          code: 'ADDRESS_MISSING_FIELDS',
          message: '价格不合法',
          details: {
            price: body.price
          }
        }
      })
    }
    patch.price = body.price
  }
  if (body.description !== undefined) patch.description = body.description
  if (body.detailHtml !== undefined) patch.detailHtml = body.detailHtml
  if (body.category !== undefined) patch.category = body.category
  if (body.image !== undefined) patch.image = body.image
  if (body.images !== undefined && Array.isArray(body.images) && body.images.length > 0) {
    patch.images = body.images
  }

  if (Object.keys(patch).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '没有可更新的字段',
      data: {
        code: 'USER_UPDATE_EMPTY',
        message: '没有可更新的字段',
        details: null
      }
    })
  }

  const updated = await updateProduct(id, patch)

  if (!updated) {
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
    message: 'Updated',
    data: updated
  }
})


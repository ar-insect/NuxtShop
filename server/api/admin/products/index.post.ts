import { readBody, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { createProduct } from '~/server/utils/product'

interface AdminProductPayload {
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

  const body = await readBody<AdminProductPayload>(event)

  if (!body.title || !body.category || !body.image || typeof body.price !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必填字段',
      data: {
        code: 'ADDRESS_MISSING_FIELDS',
        message: '缺少必填字段',
        details: {
          title: body.title,
          category: body.category,
          image: body.image,
          price: body.price
        }
      }
    })
  }

  if (body.price < 0) {
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

  const images = Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.image]

  const created = await createProduct({
    title: body.title,
    price: body.price,
    description: body.description || '',
    detailHtml: body.detailHtml,
    category: body.category,
    image: body.image,
    images
  })

  return {
    code: 200,
    message: 'Created',
    data: created
  }
}
)


import type { ApiResponse } from '~/types/common'
import type { Product } from '~/types/product'
import { findProductById } from '~/server/utils/product'

export default defineEventHandler(async (event): Promise<ApiResponse<Product | null>> => {
  const idParam = event.context.params?.id
  const id = Number(idParam)
  if (!Number.isFinite(id)) {
    return { code: 400, message: 'Invalid product id', data: null }
  }
  const product = await findProductById(id)
  return { code: 200, message: 'OK', data: product || null }
})

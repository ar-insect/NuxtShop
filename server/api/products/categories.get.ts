import type { ApiResponse } from '~/types/common'
import { findActiveCategoriesPublic } from '~/server/utils/product-category'
import { findAllCategories } from '~/server/utils/product'

export default defineEventHandler(async (): Promise<ApiResponse<{ key: string; label: string }[]>> => {
  const productKeys = await findAllCategories()
  const adminCats = await findActiveCategoriesPublic()
  const labelMap = new Map(adminCats.map(c => [c.key, c.label]))
  const items = productKeys.map(key => ({ key, label: labelMap.get(key) || key }))
  return {
    code: 200,
    message: 'OK',
    data: items
  }
})

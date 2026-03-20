import { findActiveCategoriesPublic } from '~/server/utils/product-category'
import { findAllCategories } from '~/server/utils/product'

export default defineEventHandler(async () => {
  const categories = await findActiveCategoriesPublic()

  if (categories.length > 0) {
    return categories
  }

  const keys = await findAllCategories()
  return keys.map((key) => ({
    key,
    label: key
  }))
})

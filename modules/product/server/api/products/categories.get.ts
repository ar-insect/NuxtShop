import { findActiveCategoriesPublic } from '~/server/utils/product-category'
import { findAllCategories } from '~/server/utils/product'

export default defineEventHandler(async () => {
  const [activeCategories, keys] = await Promise.all([
    findActiveCategoriesPublic(),
    findAllCategories()
  ])

  const labelByKey = new Map<string, string>()
  for (const cat of activeCategories) {
    labelByKey.set(cat.key, cat.label)
  }

  return keys.map((key) => ({
    key,
    label: labelByKey.get(key) || key
  }))
})

import { findAllCategories } from '~/server/utils/product'

const categoryLabels: Record<string, string> = {
  "men's clothing": '男装',
  jewelery: '珠宝配饰',
  electronics: '电子产品',
  "women's clothing": '女装'
}

export default defineEventHandler(async () => {
  const keys = await findAllCategories()
  return keys.map((key) => ({
    key,
    label: categoryLabels[key] || key
  }))
})


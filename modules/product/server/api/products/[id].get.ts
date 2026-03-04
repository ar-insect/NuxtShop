import { products } from '~/server/data/products'

export default defineEventHandler((event) => {
  const id = Number(event.context.params?.id)
  if (!Number.isFinite(id)) return null
  return products.find(p => p.id === id) || null
})

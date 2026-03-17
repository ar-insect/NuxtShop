import { findProductById } from '~/server/utils/product'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!Number.isFinite(id)) return null
  return await findProductById(id)
})

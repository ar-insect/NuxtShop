import { readBody } from 'h3'
import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'

interface AdminAdDocument {
  id: number
  position: string
  order: number
  active?: boolean
  image: string
  link: string
  altKey: string
}

const COLLECTION_NAME = 'ads'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = event.context.params?.id
  const id = Number(idParam)

  if (!id || Number.isNaN(id)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_INVALID_ID',
      message: 'Invalid ad id',
      details: { id: idParam }
    })
  }

  const body = await readBody<Partial<AdminAdDocument>>(event)

  const collection = getCollection<AdminAdDocument>(COLLECTION_NAME)

  const update: Partial<AdminAdDocument> = {}
  if (body.position !== undefined) update.position = body.position
  if (body.order !== undefined) update.order = body.order
  if (body.active !== undefined) update.active = body.active
  if (body.image !== undefined) update.image = body.image
  if (body.link !== undefined) update.link = body.link
  if (body.altKey !== undefined) update.altKey = body.altKey

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: update },
    { returnDocument: 'after' }
  )

  if (!result) {
    throw createApiError({
      statusCode: 404,
      code: 'ADS_NOT_FOUND',
      message: 'Ad not found',
      details: { id }
    })
  }

  return {
    code: 200,
    message: 'Updated',
    data: result
  }
})

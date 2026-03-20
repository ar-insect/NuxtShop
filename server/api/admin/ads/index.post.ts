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

  const body = await readBody<Partial<AdminAdDocument>>(event)

  if (!body.position || !body.image || !body.altKey) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: 'Missing required fields',
      details: {
        position: body.position,
        image: body.image,
        altKey: body.altKey
      }
    })
  }

  const collection = getCollection<AdminAdDocument>(COLLECTION_NAME)

  const last = await collection.find().sort({ id: -1 }).limit(1).toArray()
  const nextId = last[0]?.id ? last[0].id + 1 : 1

  const doc: AdminAdDocument = {
    id: nextId,
    position: body.position,
    order: typeof body.order === 'number' ? body.order : nextId,
    active: body.active !== false,
    image: body.image,
    link: body.link || '',
    altKey: body.altKey
  }

  await collection.insertOne(doc)

  return {
    code: 200,
    message: 'Created',
    data: doc
  }
})

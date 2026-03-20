import { getCollection } from '~/server/utils/mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'

interface AdminAdDocument {
  id: number
  active?: boolean
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

  const collection = getCollection<AdminAdDocument>(COLLECTION_NAME)

  const ad = await collection.findOne({ id })

  if (!ad) {
    throw createApiError({
      statusCode: 404,
      code: 'ADS_NOT_FOUND',
      message: 'Ad not found',
      details: { id }
    })
  }

  if (ad.active !== false) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_OPERATION_FAILED',
      message: 'Active ad cannot be deleted',
      details: { id }
    })
  }

  await collection.deleteOne({ id })

  return {
    code: 200,
    message: 'Deleted'
  }
})

import { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { deleteCoupon } from '~/server/utils/coupon'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = event.context.params?.id
  if (!idParam || !ObjectId.isValid(idParam)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_INVALID_ID',
      message: '无效的优惠券 ID',
      details: { id: idParam }
    })
  }

  const ok = await deleteCoupon(new ObjectId(idParam))

  if (!ok) {
    throw createApiError({
      statusCode: 404,
      code: 'ADS_NOT_FOUND',
      message: '优惠券不存在',
      details: { id: idParam }
    })
  }

  return {
    code: 200,
    message: 'Deleted'
  }
})


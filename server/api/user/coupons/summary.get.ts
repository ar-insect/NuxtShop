import { requireUserId } from '~/server/utils/auth'
import { countAvailableCoupons } from '~/server/utils/coupon'

export default defineEventHandler(async (event) => {
  await requireUserId(event)

  const unusedCount = await countAvailableCoupons()

  return {
    code: 200,
    message: 'OK',
    data: {
      unusedCount
    }
  }
})

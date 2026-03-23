import { defineEventHandler, readBody } from 'h3'
import { findBestCouponForAmount } from '~/server/utils/coupon'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ total: number }>(event)
  const total = typeof body?.total === 'number' && body.total > 0 ? body.total : 0

  const { coupon, discount } = await findBestCouponForAmount(total)
  const finalTotal = Math.max(total - discount, 0)

  return {
    code: 200,
    message: 'OK',
    data: {
      total,
      discount,
      finalTotal,
      coupon: coupon
        ? {
            code: coupon.code,
            name: coupon.name,
            type: coupon.type,
            amount: coupon.amount,
            minOrderAmount: coupon.minOrderAmount
          }
        : null
    }
  }
})


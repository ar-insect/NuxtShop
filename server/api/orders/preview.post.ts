import { readBody } from 'h3'
import type { ApiResponse } from '~/types/common'
import { findBestCouponForAmount } from '~/server/utils/coupon'

export default defineEventHandler(async (event): Promise<ApiResponse<{ total: number; discount: number; finalTotal: number; coupon: { id?: string; name: string } | null }>> => {
  const body = await readBody<{ total?: number }>(event)
  const total = typeof body.total === 'number' && body.total > 0 ? Number(body.total) : 0

  if (total <= 0) {
    return {
      code: 200,
      message: 'OK',
      data: { total: 0, discount: 0, finalTotal: 0, coupon: null }
    }
  }

  const { coupon, discount } = await findBestCouponForAmount(total)
  const finalTotal = Math.max(0, Number((total - discount).toFixed(2)))

  return {
    code: 200,
    message: 'OK',
    data: {
      total,
      discount,
      finalTotal,
      coupon: coupon ? { id: coupon._id?.toString(), name: coupon.name } : null
    }
  }
})

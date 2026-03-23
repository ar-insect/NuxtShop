import { readBody } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { createCoupon, type CouponType } from '~/server/utils/coupon'

interface AdminCouponPayload {
  code?: string
  name?: string
  type?: CouponType
  amount?: number
  minOrderAmount?: number
  startAt?: string | null
  endAt?: string | null
  enabled?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<AdminCouponPayload>(event)

  if (!body.code || !body.name || !body.type || typeof body.amount !== 'number' || typeof body.minOrderAmount !== 'number') {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '缺少必填字段',
      details: {
        code: body.code,
        name: body.name,
        type: body.type,
        amount: body.amount,
        minOrderAmount: body.minOrderAmount
      }
    })
  }

  if (!['fixed', 'percent'].includes(body.type)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '优惠券类型不合法',
      details: { type: body.type }
    })
  }

  if (body.amount <= 0) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '优惠金额必须大于 0',
      details: { amount: body.amount }
    })
  }

  if (body.type === 'percent' && body.amount > 100) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '折扣百分比不能大于 100',
      details: { amount: body.amount }
    })
  }

  if (body.minOrderAmount < 0) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '最低订单金额不能为负数',
      details: { minOrderAmount: body.minOrderAmount }
    })
  }

  const startAt = body.startAt ? new Date(body.startAt) : null
  const endAt = body.endAt ? new Date(body.endAt) : null

  if (startAt && endAt && startAt > endAt) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_MISSING_FIELDS',
      message: '开始时间不能晚于结束时间',
      details: { startAt: body.startAt, endAt: body.endAt }
    })
  }

  const created = await createCoupon({
    code: body.code,
    name: body.name,
    type: body.type,
    amount: body.amount,
    minOrderAmount: body.minOrderAmount,
    startAt,
    endAt,
    enabled: body.enabled
  })

  if (!created) {
    throw createApiError({
      statusCode: 409,
      code: 'ADS_OPERATION_FAILED',
      message: '优惠券编码已存在',
      details: { code: body.code }
    })
  }

  return {
    code: 200,
    message: 'Created',
    data: {
      id: created._id?.toString() || '',
      code: created.code,
      name: created.name,
      type: created.type,
      amount: created.amount,
      minOrderAmount: created.minOrderAmount,
      startAt: created.startAt,
      endAt: created.endAt,
      enabled: created.enabled,
      createdAt: created.createdAt
    }
  }
})

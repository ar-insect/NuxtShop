import { readBody } from 'h3'
import { ObjectId } from 'mongodb'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { updateCoupon, type CouponType } from '~/server/utils/coupon'

interface AdminCouponUpdatePayload {
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

  const idParam = event.context.params?.id
  if (!idParam || !ObjectId.isValid(idParam)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_INVALID_ID',
      message: '无效的优惠券 ID',
      details: { id: idParam }
    })
  }

  const body = await readBody<AdminCouponUpdatePayload>(event)

  const patch: AdminCouponUpdatePayload = {}

  if (body.name !== undefined) patch.name = body.name
  if (body.type !== undefined) {
    if (!['fixed', 'percent'].includes(body.type)) {
      throw createApiError({
        statusCode: 400,
        code: 'ADS_OPERATION_FAILED',
        message: '优惠券类型不合法',
        details: { type: body.type }
      })
    }
    patch.type = body.type
  }
  if (body.amount !== undefined) {
    if (body.amount <= 0) {
      throw createApiError({
        statusCode: 400,
        code: 'ADS_OPERATION_FAILED',
        message: '优惠金额必须大于 0',
        details: { amount: body.amount }
      })
    }
    if (body.type === 'percent' && body.amount > 100) {
      throw createApiError({
        statusCode: 400,
        code: 'ADS_OPERATION_FAILED',
        message: '折扣百分比不能大于 100',
        details: { amount: body.amount }
      })
    }
    patch.amount = body.amount
  }
  if (body.minOrderAmount !== undefined) {
    if (body.minOrderAmount < 0) {
      throw createApiError({
        statusCode: 400,
        code: 'ADS_OPERATION_FAILED',
        message: '最低订单金额不能为负数',
        details: { minOrderAmount: body.minOrderAmount }
      })
    }
    patch.minOrderAmount = body.minOrderAmount
  }
  if (body.startAt !== undefined) {
    patch.startAt = body.startAt ? new Date(body.startAt).toISOString() : null
  }
  if (body.endAt !== undefined) {
    patch.endAt = body.endAt ? new Date(body.endAt).toISOString() : null
  }
  if (body.enabled !== undefined) patch.enabled = body.enabled

  if (Object.keys(patch).length === 0) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_OPERATION_FAILED',
      message: '没有可更新的字段',
      details: null
    })
  }

  if (patch.startAt && patch.endAt && patch.startAt > patch.endAt) {
    throw createApiError({
      statusCode: 400,
      code: 'ADS_OPERATION_FAILED',
      message: '开始时间不能晚于结束时间',
      details: { startAt: body.startAt, endAt: body.endAt }
    })
  }

  const updated = await updateCoupon(new ObjectId(idParam), patch as any)

  if (!updated) {
    throw createApiError({
      statusCode: 404,
      code: 'ADS_NOT_FOUND',
      message: '优惠券不存在',
      details: { id: idParam }
    })
  }

  return {
    code: 200,
    message: 'Updated',
    data: {
      id: updated._id?.toString() || '',
      code: updated.code,
      name: updated.name,
      type: updated.type,
      amount: updated.amount,
      minOrderAmount: updated.minOrderAmount,
      startAt: updated.startAt ? updated.startAt.toISOString() : null,
      endAt: updated.endAt ? updated.endAt.toISOString() : null,
      enabled: updated.enabled,
      createdAt: updated.createdAt
    }
  }
})

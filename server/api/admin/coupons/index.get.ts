import { getQuery } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { findCouponsWithFilters } from '~/server/utils/coupon'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = query.page ? Number(query.page) || 1 : 1
  const limit = query.limit ? Number(query.limit) || 20 : 20
  const keyword = typeof query.keyword === 'string' ? query.keyword : ''
  const enabledParam = typeof query.enabled === 'string' ? query.enabled : undefined

  let enabled: boolean | undefined
  if (enabledParam === 'true') enabled = true
  else if (enabledParam === 'false') enabled = false

  try {
    const { items, total } = await findCouponsWithFilters({
      page,
      limit,
      keyword,
      enabled
    })

    const response: ApiResponse<{ items: any[]; total: number }> = {
      code: 200,
      message: 'OK',
      data: {
        items: items.map((c) => ({
          id: c._id?.toString() || '',
          code: c.code,
          name: c.name,
          type: c.type,
          amount: c.amount,
          minOrderAmount: c.minOrderAmount,
          startAt: c.startAt ? c.startAt.toISOString() : null,
          endAt: c.endAt ? c.endAt.toISOString() : null,
          enabled: c.enabled,
          createdAt: c.createdAt.toISOString()
        })),
        total
      }
    }
    return response
  } catch (error) {
    throw createApiError({
      statusCode: 500,
      code: 'ADS_OPERATION_FAILED',
      message: '获取优惠券列表失败',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

import { readBody } from 'h3'
import { requireSuperAdmin } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { updateSystemSettings } from '~/server/utils/system-setting'

interface AdminSystemSettingsPayload {
  shipping?: {
    baseFee?: number
    freeThreshold?: number | null
  }
  payments?: {
    alipay?: boolean
    wechat?: boolean
    creditCard?: boolean
  }
}

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const body = await readBody<AdminSystemSettingsPayload>(event)

  if (!body.shipping && !body.payments) {
    throw createApiError({
      statusCode: 400,
      code: 'SYSTEM_SETTING_OPERATION_FAILED',
      message: '没有可更新的配置',
      details: null
    })
  }

  if (body.shipping) {
    if (body.shipping.baseFee !== undefined && body.shipping.baseFee < 0) {
      throw createApiError({
        statusCode: 400,
        code: 'SYSTEM_SETTING_OPERATION_FAILED',
        message: '运费不能为负数',
        details: { baseFee: body.shipping.baseFee }
      })
    }
    if (body.shipping.freeThreshold !== undefined && body.shipping.freeThreshold !== null && body.shipping.freeThreshold < 0) {
      throw createApiError({
        statusCode: 400,
        code: 'SYSTEM_SETTING_OPERATION_FAILED',
        message: '包邮门槛不能为负数',
        details: { freeThreshold: body.shipping.freeThreshold }
      })
    }
  }

  try {
    const updated = await updateSystemSettings(body as any)

    return {
      code: 200,
      message: 'Updated',
      data: {
        shipping: updated.shipping,
        payments: updated.payments,
        updatedAt: updated.updatedAt.toISOString()
      }
    }
  } catch (error) {
    throw createApiError({
      statusCode: 500,
      code: 'SYSTEM_SETTING_OPERATION_FAILED',
      message: '更新系统配置失败',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

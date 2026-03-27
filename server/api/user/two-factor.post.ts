import { readBody } from 'h3'
import { requireUserId } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { updateUser } from '~/server/utils/user'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event): Promise<ApiResponse<{ enabled: boolean }>> => {
  const userId = requireUserId(event)
  const body = await readBody<{ enabled?: boolean }>(event)

  if (typeof body.enabled !== 'boolean') {
    throw createApiError({
      statusCode: 400,
      code: 'USER_UPDATE_EMPTY',
      message: '缺少必要参数',
      details: null
    })
  }

  const updated = await updateUser(userId, { twoFactorEnabled: body.enabled })
  if (!updated) {
    throw createApiError({
      statusCode: 500,
      code: 'USER_UPDATE_FAILED',
      message: '更新二步验证状态失败',
      details: null
    })
  }

  return {
    code: 200,
    message: '二步验证状态已更新',
    data: { enabled: !!updated.twoFactorEnabled }
  }
})

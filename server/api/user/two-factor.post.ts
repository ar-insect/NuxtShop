import { readBody } from 'h3'
import { requireUserId } from '~/server/utils/auth'
import { findUserById, updateUser } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'

interface TwoFactorPayload {
  enabled?: boolean
}

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const body = await readBody<TwoFactorPayload>(event)
  const enabled = !!body.enabled

  const user = await findUserById(userId)

  if (!user) {
    throw createApiError({
      statusCode: 404,
      code: 'AUTH_USER_NOT_FOUND',
      message: '用户不存在',
      details: null
    })
  }

  if (enabled && !user.phone) {
    throw createApiError({
      statusCode: 400,
      code: 'USER_UPDATE_FAILED',
      message: '开启两步验证前请先绑定手机号',
      details: null
    })
  }

  const updated = await updateUser(userId, { twoFactorEnabled: enabled })

  if (!updated) {
    throw createApiError({
      statusCode: 500,
      code: 'USER_UPDATE_FAILED',
      message: '更新两步验证状态失败，请稍后重试',
      details: null
    })
  }

  return {
    code: 200,
    message: enabled ? '两步验证已开启' : '两步验证已关闭',
    data: {
      twoFactorEnabled: updated.twoFactorEnabled
    }
  }
})


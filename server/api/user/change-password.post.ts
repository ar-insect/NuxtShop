import { readBody } from 'h3'
import { requireUserId } from '~/server/utils/auth'
import { createApiError } from '~/server/utils/api-error'
import { findUserById, updateUser, verifyPassword } from '~/server/utils/user'
import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (event): Promise<ApiResponse<{ success: boolean }>> => {
  const userId = requireUserId(event)
  const body = await readBody<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>(event)
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_MISSING_FIELDS',
      message: '缺少必要参数',
      details: null
    })
  }

  if (newPassword !== confirmPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_MISMATCH',
      message: '两次输入的密码不一致',
      details: null
    })
  }

  if (newPassword.length < 8) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_WEAK',
      message: '新密码长度至少 8 位',
      details: null
    })
  }

  const user = await findUserById(userId)
  if (!user || !user.password) {
    throw createApiError({
      statusCode: 404,
      code: 'AUTH_USER_NOT_FOUND',
      message: '用户不存在',
      details: null
    })
  }

  const ok = await verifyPassword(currentPassword, user.password)
  if (!ok) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_INVALID_CURRENT',
      message: '当前密码不正确',
      details: null
    })
  }

  if (currentPassword === newPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_SAME_AS_OLD',
      message: '新密码不能与旧密码相同',
      details: null
    })
  }

  const updated = await updateUser(userId, { password: newPassword })
  if (!updated) {
    throw createApiError({
      statusCode: 500,
      code: 'AUTH_CHANGE_PASSWORD_FAILED',
      message: '密码更新失败',
      details: null
    })
  }

  return {
    code: 200,
    message: '密码更新成功',
    data: { success: true }
  }
})

import { readBody } from 'h3'
import { requireUserId } from '~/server/utils/auth'
import { findUserById, updateUser, verifyPassword } from '~/server/utils/user'
import { createApiError } from '~/server/utils/api-error'

interface ChangePasswordPayload {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const body = await readBody<ChangePasswordPayload>(event)

  const currentPassword = body.currentPassword?.trim() || ''
  const newPassword = body.newPassword?.trim() || ''
  const confirmPassword = body.confirmPassword?.trim() || ''

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_MISSING_FIELDS',
      message: '请完整填写当前密码与新密码',
      details: null
    })
  }

  if (newPassword !== confirmPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_MISMATCH',
      message: '两次输入的新密码不一致',
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

  if (newPassword === currentPassword) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_CHANGE_PASSWORD_SAME_AS_OLD',
      message: '新密码不能与当前密码相同',
      details: null
    })
  }

  const user = await findUserById(userId)

  if (!user || !user.password) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_USER_NOT_FOUND',
      message: '用户不存在或未设置密码',
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

  const updated = await updateUser(userId, { password: newPassword })

  if (!updated) {
    throw createApiError({
      statusCode: 500,
      code: 'AUTH_CHANGE_PASSWORD_FAILED',
      message: '修改密码失败，请稍后再试',
      details: null
    })
  }

  return {
    code: 200,
    message: 'OK',
    data: null
  }
})

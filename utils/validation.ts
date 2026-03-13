const PHONE_REGEX = /^1[3-9]\d{9}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRequired = (value: string, message: string) => {
  if (!value || !value.trim()) return message
  return null
}

export const validateUsername = (value: string) => {
  if (!value || !value.trim()) return '请输入用户名'
  return null
}

export const validatePassword = (value: string) => {
  if (!value) return '请输入密码'
  if (value.length < 6) return '密码长度至少需要6位'
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return '请再次输入密码'
  if (password !== confirmPassword) return '两次输入的密码不一致'
  return null
}

export const validatePhone = (value: string) => {
  if (!value || !value.trim()) return '请输入手机号码'
  if (!PHONE_REGEX.test(value)) return '请输入有效的11位手机号码'
  return null
}

export const validateEmail = (value: string) => {
  if (!value || !value.trim()) return '请输入邮箱地址'
  if (!EMAIL_REGEX.test(value)) return '请输入有效的邮箱地址'
  return null
}


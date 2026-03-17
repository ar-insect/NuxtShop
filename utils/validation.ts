const PHONE_REGEX = /^1[3-9]\d{9}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRequired = (value: string, message: string) => {
  if (!value || !value.trim()) return message
  return null
}

export const validateUsername = (value: string) => {
  if (!value || !value.trim()) return 'validation.usernameRequired'
  return null
}

export const validatePassword = (value: string) => {
  if (!value) return 'validation.passwordRequired'
  if (value.length < 6) return 'validation.passwordTooShort'
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return 'validation.confirmPasswordRequired'
  if (password !== confirmPassword) return 'validation.confirmPasswordMismatch'
  return null
}

export const validatePhone = (value: string) => {
  if (!value || !value.trim()) return 'validation.phoneRequired'
  if (!PHONE_REGEX.test(value)) return 'validation.phoneInvalid'
  return null
}

export const validateEmail = (value: string) => {
  if (!value || !value.trim()) return 'validation.emailRequired'
  if (!EMAIL_REGEX.test(value)) return 'validation.emailInvalid'
  return null
}

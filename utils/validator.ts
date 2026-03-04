/**
 * Validates if a string is a valid email address.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
export const isEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validates if a string is a valid mobile phone number (Mainland China).
 * 
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
export const isMobile = (phone: string): boolean => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

/**
 * Validates if a string is a valid URL.
 * 
 * @param {string} url - The URL to validate.
 * @returns {boolean} True if the URL is valid, false otherwise.
 */
export const isUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a value is empty.
 * Returns true for null, undefined, empty string, empty array, or empty object.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

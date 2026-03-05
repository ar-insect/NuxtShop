/**
 * 校验字符串是否为合法的邮箱地址。
 * 
 * @param {string} email - 待校验的邮箱地址
 * @returns {boolean} 合法返回 true，否则返回 false
 */
export const isEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 校验字符串是否为合法的手机号（中国大陆）。
 * 
 * @param {string} phone - 待校验的手机号
 * @returns {boolean} 合法返回 true，否则返回 false
 */
export const isMobile = (phone: string): boolean => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

/**
 * 校验字符串是否为合法的 URL。
 * 
 * @param {string} url - 待校验的 URL
 * @returns {boolean} 合法返回 true，否则返回 false
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
 * 判断值是否为空。
 * 对 null、undefined、空字符串、空数组、空对象返回 true。
 * 
 * @param {any} value - 待判断的值
 * @returns {boolean} 为空返回 true，否则返回 false
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

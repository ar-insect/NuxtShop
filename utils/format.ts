/**
 * 将数字格式化为货币字符串。
 * 
 * @param {number | string} amount - 待格式化的金额
 * @param {string} [currency='¥'] - 货币符号（默认：¥）
 * @param {number} [decimals=2] - 小数位数（默认：2）
 * @returns {string} 格式化后的货币字符串（如 "¥1,234.56"）
 */
export const formatCurrency = (amount: number | string, currency: string = '¥', decimals: number = 2): string => {
  const num = Number(amount)
  if (isNaN(num)) return `${currency}0.00`
  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 将数字格式化为带千分位分隔符的字符串。
 * 
 * @param {number | string} num - 待格式化的数字
 * @returns {string} 格式化后的字符串（如 "1,234,567"）
 */
export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined) return ''
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 隐藏手机号中间四位数字。
 * 
 * @param {string} phone - 待处理的手机号
 * @returns {string} 处理后的手机号（如 "138****1234"）
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

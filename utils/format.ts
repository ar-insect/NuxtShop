/**
 * Formats a number as a currency string.
 * 
 * @param {number | string} amount - The amount to format.
 * @param {string} [currency='¥'] - The currency symbol (default: '¥').
 * @param {number} [decimals=2] - The number of decimal places (default: 2).
 * @returns {string} The formatted currency string (e.g., "¥1,234.56").
 */
export const formatCurrency = (amount: number | string, currency: string = '¥', decimals: number = 2): string => {
  const num = Number(amount)
  if (isNaN(num)) return `${currency}0.00`
  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Formats a number with thousands separators.
 * 
 * @param {number | string} num - The number to format.
 * @returns {string} The formatted number string (e.g., "1,234,567").
 */
export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined) return ''
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Masks the middle four digits of a phone number.
 * 
 * @param {string} phone - The phone number to mask.
 * @returns {string} The masked phone number (e.g., "138****1234").
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

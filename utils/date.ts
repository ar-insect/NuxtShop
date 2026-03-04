/**
 * Formats a date object or timestamp into a YYYY-MM-DD string.
 * 
 * @param {Date | number | string} date - The date to format (Date object, timestamp, or date string).
 * @returns {string} The formatted date string, or an empty string if the date is invalid.
 */
export const formatDate = (date: Date | number | string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formats a date object or timestamp into a YYYY-MM-DD HH:mm:ss string.
 * 
 * @param {Date | number | string} date - The date to format (Date object, timestamp, or date string).
 * @returns {string} The formatted date-time string, or an empty string if the date is invalid.
 */
export const formatDateTime = (date: Date | number | string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Calculates the relative time string (e.g., "Just now", "1 minute ago") from a given date.
 * 
 * @param {Date | number | string} date - The date to calculate relative time from.
 * @returns {string} The relative time description.
 */
export const timeAgo = (date: Date | number | string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}个月前`
  
  return `${Math.floor(diff / 31536000)}年前`
}

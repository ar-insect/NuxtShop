/**
 * 将日期对象或时间戳格式化为 YYYY-MM-DD 字符串。
 * 
 * @param {Date | number | string} date - 待格式化的日期（Date/时间戳/日期字符串）
 * @returns {string} 格式化后的日期字符串；无效日期返回空字符串
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
 * 将日期对象或时间戳格式化为 YYYY-MM-DD HH:mm:ss 字符串。
 * 
 * @param {Date | number | string} date - 待格式化的日期（Date/时间戳/日期字符串）
 * @returns {string} 格式化后的日期时间字符串；无效日期返回空字符串
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
 * 根据给定日期计算相对时间文案（如“刚刚”“1 分钟前”）。
 * 
 * @param {Date | number | string} date - 用于计算相对时间的日期
 * @returns {string} 相对时间描述
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

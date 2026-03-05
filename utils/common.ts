/**
 * 创建防抖函数：在最后一次调用后延迟 `delay` 毫秒再执行传入函数。
 * 
 * @template T
 * @param {T} fn - 需要防抖的函数
 * @param {number} [delay=300] - 延迟时间（毫秒）
 * @returns {(...args: Parameters<T>) => void} 防抖后的新函数
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number = 300) => {
  let timer: any = null
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 创建节流函数：在每 `limit` 毫秒内最多执行一次传入函数。
 * 
 * @template T
 * @param {T} fn - 需要节流的函数
 * @param {number} [limit=300] - 节流间隔（毫秒）
 * @returns {(...args: Parameters<T>) => void} 节流后的新函数
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number = 300) => {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝对象或数组。
 * 支持嵌套对象、数组、Date 与 RegExp。
 * 
 * @template T
 * @param {T} obj - 需要拷贝的对象
 * @returns {T} 深拷贝后的结果
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as any
  if (obj instanceof RegExp) return new RegExp(obj) as any
  
  const clone = (Array.isArray(obj) ? [] : {}) as T
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clone as any)[key] = deepClone((obj as any)[key])
    }
  }
  
  return clone
}

export const limit = (value: number, min: number = 0, max: number = Number.POSITIVE_INFINITY) => {
  if (!Number.isFinite(value)) return min
  if (!Number.isFinite(min)) min = 0
  if (!Number.isFinite(max)) max = Number.POSITIVE_INFINITY
  if (min > max) [min, max] = [max, min]
  return Math.min(max, Math.max(min, value))
}

export const max = (...values: number[]) => {
  if (!values || values.length === 0) return -Infinity
  let m = -Infinity
  for (const v of values) {
    if (Number.isFinite(v) && v > m) m = v
  }
  return m
}

export const min = (...values: number[]) => {
  if (!values || values.length === 0) return Infinity
  let m = Infinity
  for (const v of values) {
    if (Number.isFinite(v) && v < m) m = v
  }
  return m
}

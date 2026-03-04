/**
 * Creates a debounced function that delays invoking the provided function until after `delay` milliseconds have elapsed since the last time it was invoked.
 * 
 * @template T
 * @param {T} fn - The function to debounce.
 * @param {number} [delay=300] - The number of milliseconds to delay.
 * @returns {(...args: Parameters<T>) => void} A new debounced function.
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
 * Creates a throttled function that only invokes the provided function at most once per every `limit` milliseconds.
 * 
 * @template T
 * @param {T} fn - The function to throttle.
 * @param {number} [limit=300] - The number of milliseconds to throttle invocations to.
 * @returns {(...args: Parameters<T>) => void} A new throttled function.
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
 * Creates a deep clone of an object or array.
 * Handles nested objects, arrays, Dates, and RegExps.
 * 
 * @template T
 * @param {T} obj - The object to clone.
 * @returns {T} A deep copy of the object.
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

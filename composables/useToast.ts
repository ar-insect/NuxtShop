/**
 * Toast 通知选项接口。
 * @interface ToastOptions
 * @property {string} message - 展示的消息内容
 * @property {'success' | 'error' | 'warning' | 'info'} [type] - 通知类型（默认：info）
 * @property {number} [duration] - 展示时长（毫秒）
 */
export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

/**
 * Toast 内部状态接口。
 * 在 ToastOptions 基础上增加 id 与可见性状态。
 * @interface ToastState
 * @extends {ToastOptions}
 * @property {string} id - Toast 唯一标识
 * @property {boolean} visible - 当前是否可见
 */
export interface ToastState extends ToastOptions {
  id: string
  visible: boolean
}

/**
 * Toast 通知管理组合式函数。
 * 提供 success/error/warning/info 的快捷方法。
 * 
 * @returns {Object} Toast 状态与方法
 * @property {Ref<ToastState[]>} toasts - 当前激活的 Toast 列表（响应式）
 * @property {Function} show - 展示一个 Toast（自定义选项）
 * @property {Function} remove - 根据 id 移除某个 Toast
 * @property {Function} clear - 清空所有 Toast
 * @property {Function} success - 快捷展示 success Toast
 * @property {Function} error - 快捷展示 error Toast
 * @property {Function} warning - 快捷展示 warning Toast
 * @property {Function} info - 快捷展示 info Toast
 */
export const useToast = () => {
  const toasts = useState<ToastState[]>('toasts', () => [])

  /**
   * 展示一个新的 Toast 通知。
   * 
   * @param {ToastOptions | string} options - Toast 选项对象或消息字符串
   * @returns {string} 创建的 Toast id
   */
  const show = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { message: options } : options
    // 生成唯一 id
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
    
    const toast: ToastState = {
      id,
      visible: true,
      type: opts.type || 'info',
      duration: opts.duration ?? 3000,
      message: opts.message
    }

    toasts.value.push(toast)

    if (toast.duration! > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }
    
    return id
  }

  /**
   * 根据 id 移除一个 Toast 通知。
   * 
   * @param {string} id - 要移除的 Toast id
   */
  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  /**
   * 清空所有激活的 Toast 通知。
   */
  const clear = () => {
    toasts.value = []
  }

  const success = (message: string, duration?: number) => show({ message, type: 'success', duration })
  const error = (message: string, duration?: number) => show({ message, type: 'error', duration })
  const warning = (message: string, duration?: number) => show({ message, type: 'warning', duration })
  const info = (message: string, duration?: number) => show({ message, type: 'info', duration })

  return {
    toasts,
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}

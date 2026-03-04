/**
 * Interface for toast notification options.
 * @interface ToastOptions
 * @property {string} message - The message to display
 * @property {'success' | 'error' | 'warning' | 'info'} [type] - The type of toast (default: 'info')
 * @property {number} [duration] - Duration in milliseconds to show the toast
 */
export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

/**
 * Interface for internal toast state.
 * Extends ToastOptions with ID and visibility status.
 * @interface ToastState
 * @extends {ToastOptions}
 * @property {string} id - Unique identifier for the toast
 * @property {boolean} visible - Whether the toast is currently visible
 */
export interface ToastState extends ToastOptions {
  id: string
  visible: boolean
}

/**
 * Composable for managing toast notifications.
 * Provides methods to show success, error, warning, and info messages.
 * 
 * @returns {Object} Toast state and methods
 * @property {Ref<ToastState[]>} toasts - Reactive array of active toasts
 * @property {Function} show - Shows a toast with custom options
 * @property {Function} remove - Removes a specific toast by ID
 * @property {Function} clear - Removes all toasts
 * @property {Function} success - Shortcut to show a success toast
 * @property {Function} error - Shortcut to show an error toast
 * @property {Function} warning - Shortcut to show a warning toast
 * @property {Function} info - Shortcut to show an info toast
 */
export const useToast = () => {
  const toasts = useState<ToastState[]>('toasts', () => [])

  /**
   * Shows a new toast notification.
   * 
   * @param {ToastOptions | string} options - Toast options object or message string
   * @returns {string} The ID of the created toast
   */
  const show = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { message: options } : options
    // Generate a unique ID
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
   * Removes a toast notification by its ID.
   * 
   * @param {string} id - The ID of the toast to remove
   */
  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  /**
   * Clears all active toast notifications.
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

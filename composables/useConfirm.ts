interface ConfirmOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  closeOnMask?: boolean
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  type: 'info' | 'warning' | 'danger'
  confirmText: string
  cancelText: string
  closeOnMask: boolean
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  title: '提示',
  message: '',
  type: 'warning',
  confirmText: '确认',
  cancelText: '取消',
  closeOnMask: true,
  resolve: null
})

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    // Reset state defaults
    state.title = '提示'
    state.type = 'warning'
    state.confirmText = '确认'
    state.cancelText = '取消'
    state.closeOnMask = true

    if (typeof options === 'string') {
      state.message = options
    } else {
      state.title = options.title || state.title
      state.message = options.message
      state.type = options.type || state.type
      state.confirmText = options.confirmText || state.confirmText
      state.cancelText = options.cancelText || state.cancelText
      state.closeOnMask = options.closeOnMask ?? state.closeOnMask
    }

    state.isOpen = true

    return new Promise((resolve) => {
      state.resolve = resolve
    })
  }

  const handleConfirm = () => {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(true)
      state.resolve = null
    }
  }

  const handleCancel = () => {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(false)
      state.resolve = null
    }
  }

  return {
    ...toRefs(state),
    confirm,
    handleConfirm,
    handleCancel
  }
}
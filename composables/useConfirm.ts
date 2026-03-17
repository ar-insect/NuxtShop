import { useI18n } from '~/composables/useI18n'

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
  title: '',
  message: '',
  type: 'warning',
  confirmText: '',
  cancelText: '',
  closeOnMask: true,
  resolve: null
})

export const useConfirm = () => {
  const { t } = useI18n()

  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    // Reset state defaults（使用当前语言）
    state.title = t('ui.modal.title')
    state.type = 'warning'
    state.confirmText = t('ui.modal.confirm')
    state.cancelText = t('ui.modal.cancel')
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

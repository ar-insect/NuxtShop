/**
 * 全局登录弹窗状态管理组合式函数。
 */
export const useLoginModal = () => {
  const isOpen = useState<boolean>('login-modal-open', () => false)

  const openLoginModal = () => {
    // 即使当前处于不一致状态，也确保弹窗能可靠打开
    if (isOpen.value) {
      isOpen.value = false
      queueMicrotask(() => { isOpen.value = true })
    } else {
      isOpen.value = true
    }
  }

  const closeLoginModal = () => {
    isOpen.value = false
  }

  const toggleLoginModal = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openLoginModal,
    closeLoginModal,
    toggleLoginModal
  }
}

/**
 * Composable for managing the global login modal state.
 */
export const useLoginModal = () => {
  const isOpen = useState<boolean>('login-modal-open', () => false)

  const openLoginModal = () => {
    // Ensure modal reliably opens even if currently in an inconsistent state
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

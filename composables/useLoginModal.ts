/**
 * Composable for managing the global login modal state.
 */
export const useLoginModal = () => {
  const isOpen = useState<boolean>('login-modal-open', () => false)

  const openLoginModal = () => {
    isOpen.value = true
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
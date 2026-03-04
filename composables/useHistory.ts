import type { Product } from '~/modules/product/composables/useProducts'

/**
 * Composable for managing user browsing history.
 * Tracks recently viewed products.
 * 
 * @returns {Object} History state and methods
 * @property {Ref<Product[]>} historyItems - Reactive array of recently viewed products
 * @property {Function} fetchHistory - Fetches history from the server
 * @property {Function} addToHistory - Adds a product to the history
 * @property {Function} clearHistory - Clears the browsing history
 */
export const useHistory = () => {
  const historyItems = useState<Product[]>('history', () => [])

  // Sync with server on mount (client-side only to avoid hydration mismatch if SSR data differs)
  // Actually, for history, it's user-specific, so SSR is fine if we use useAsyncData but it might be tricky with session cookies on first load.
  // Let's stick to client-side fetch for history to be safe and fast on navigation.
  /**
   * Fetches the user's browsing history from the server.
   * Updates the historyItems state.
   * 
   * @async
   */
  const fetchHistory = async () => {
    try {
      const data = await $fetch<Product[]>('/api/history')
      historyItems.value = data || []
    } catch (e) {
      console.error('Failed to fetch history:', e)
    }
  }

  /**
   * Adds a product to the browsing history.
   * Performs an optimistic update and limits history to 20 items.
   * 
   * @async
   * @param {Product} product - The product to add to history
   */
  const addToHistory = async (product: Product) => {
    if (!product || !product.id) return

    // Optimistic update
    const index = historyItems.value.findIndex(item => item.id === product.id)
    if (index > -1) {
      historyItems.value.splice(index, 1)
    }
    historyItems.value.unshift(product)
    if (historyItems.value.length > 20) {
      historyItems.value = historyItems.value.slice(0, 20)
    }

    try {
      await $fetch('/api/history/add', {
        method: 'POST',
        body: product
      })
    } catch (e) {
      console.error('Failed to add to history:', e)
      // Revert on failure? Maybe not critical for history.
    }
  }

  /**
   * Clears the user's browsing history.
   * 
   * @async
   */
  const clearHistory = async () => {
    historyItems.value = []
    try {
      await $fetch('/api/history/clear', {
        method: 'POST'
      })
    } catch (e) {
      console.error('Failed to clear history:', e)
    }
  }

  return {
    historyItems,
    fetchHistory,
    addToHistory,
    clearHistory
  }
}

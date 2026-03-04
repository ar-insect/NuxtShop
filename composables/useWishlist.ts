import type { Product } from '~/modules/product/composables/useProducts'

/**
 * Composable for managing the user's wishlist.
 * Handles adding, removing, and toggling items in the wishlist.
 * Syncs data with the server.
 * 
 * @returns {Object} Wishlist state and methods
 * @property {Ref<Product[]>} wishlistItems - Reactive array of products in the wishlist
 * @property {Function} addToWishlist - Adds a product to the wishlist
 * @property {Function} removeFromWishlist - Removes a product from the wishlist
 * @property {Function} toggleWishlist - Toggles a product's presence in the wishlist
 * @property {Function} isInWishlist - Checks if a product is in the wishlist
 */
export const useWishlist = () => {
  const wishlistItems = useState<Product[]>('wishlist', () => [])

  // Sync with server
  const { data } = useFetch<Product[]>('/api/wishlist', {
    key: 'wishlist-data',
    lazy: true
  })

  // Watch for data changes from server
  watch(data, (newWishlist) => {
    if (newWishlist && wishlistItems.value.length === 0) {
      wishlistItems.value = newWishlist
    }
  }, { immediate: true })

  /**
   * Persists the current wishlist state to the server.
   * @async
   * @private
   */
  const saveWishlist = async () => {
    try {
      await $fetch('/api/wishlist', {
        method: 'POST',
        body: wishlistItems.value
      })
    } catch (e) {
      console.error('Failed to save wishlist', e)
    }
  }

  /**
   * Adds a product to the wishlist if it's not already there.
   * 
   * @async
   * @param {Product} product - The product to add
   */
  const addToWishlist = async (product: Product) => {
    if (!isInWishlist(product.id)) {
      wishlistItems.value.push(product)
      await saveWishlist()
    }
  }

  /**
   * Removes a product from the wishlist by its ID.
   * 
   * @async
   * @param {number} productId - The ID of the product to remove
   */
  const removeFromWishlist = async (productId: number) => {
    const index = wishlistItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      wishlistItems.value.splice(index, 1)
      await saveWishlist()
    }
  }

  /**
   * Toggles a product in the wishlist (adds if missing, removes if present).
   * 
   * @async
   * @param {Product} product - The product to toggle
   */
  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  /**
   * Checks if a product is currently in the wishlist.
   * 
   * @param {number} productId - The ID of the product to check
   * @returns {boolean} True if the product is in the wishlist, false otherwise
   */
  const isInWishlist = (productId: number) => {
    return wishlistItems.value.some(item => item.id === productId)
  }

  const resetWishlistLocal = () => {
    wishlistItems.value = []
  }

  const refreshWishlist = async () => {
    try {
      const latest = await $fetch<Product[]>('/api/wishlist')
      wishlistItems.value = Array.isArray(latest) ? latest : []
    } catch {
      wishlistItems.value = []
    }
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    resetWishlistLocal,
    refreshWishlist
  }
}

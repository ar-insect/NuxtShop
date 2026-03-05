import type { Product } from '~/modules/product/composables/useProducts'

/**
 * 收藏夹管理组合式函数。
 * 负责收藏夹条目的添加、移除与切换，并与服务端同步数据。
 * 
 * @returns {Object} 收藏夹状态与方法
 * @property {Ref<Product[]>} wishlistItems - 收藏的商品列表（响应式）
 * @property {Function} addToWishlist - 添加收藏
 * @property {Function} removeFromWishlist - 取消收藏
 * @property {Function} toggleWishlist - 切换收藏状态
 * @property {Function} isInWishlist - 判断是否已收藏
 */
export const useWishlist = () => {
  const wishlistItems = useState<Product[]>('wishlist', () => [])

  // 与服务端同步
  const { data, refresh } = useFetch<Product[]>('/api/wishlist', {
    key: 'wishlist-data',
    lazy: true
  })

  // 监听服务端数据变化
  watch(data, (newWishlist) => {
    if (newWishlist) {
      wishlistItems.value = newWishlist
    }
  }, { immediate: true })

  /**
   * 将当前收藏夹状态持久化到服务端。
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
   * 添加商品到收藏夹（若尚未收藏）。
   * 
   * @async
   * @param {Product} product - 要收藏的商品
   */
  const addToWishlist = async (product: Product) => {
    if (!isInWishlist(product.id)) {
      wishlistItems.value.push(product)
      await saveWishlist()
    }
  }

  /**
   * 根据商品 ID 将其从收藏夹移除。
   * 
   * @async
   * @param {number} productId - 要移除的商品 ID
   */
  const removeFromWishlist = async (productId: number) => {
    const index = wishlistItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      wishlistItems.value.splice(index, 1)
      await saveWishlist()
    }
  }

  /**
   * 切换商品的收藏状态（未收藏则添加，已收藏则移除）。
   * 
   * @async
   * @param {Product} product - 需要切换收藏状态的商品
   */
  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  /**
   * 判断商品是否已在收藏夹中。
   * 
   * @param {number} productId - 商品 ID
   * @returns {boolean} 已收藏返回 true，否则返回 false
   */
  const isInWishlist = (productId: number) => {
    return wishlistItems.value.some(item => item.id === productId)
  }

  const resetWishlistLocal = () => {
    wishlistItems.value = []
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    resetWishlistLocal,
    refreshWishlist: refresh
  }
}

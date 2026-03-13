import type { Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'

/**
 * 表示购物车中的一条商品项。
 * 在 Product 基础上增加 quantity 数量字段。
 * @interface CartItem
 * @extends {Product}
 * @property {number} quantity - 该商品在购物车中的数量
 */
export interface CartItem extends Product {
  quantity: number
}

/**
 * 购物车状态与操作的组合式函数。
 * 负责添加、移除、更新数量，并与服务端同步数据。
 * 
 * @returns {Object} 购物车状态与方法
 * @property {Ref<CartItem[]>} cartItems - 购物车商品列表（响应式）
 * @property {Function} addToCart - 添加商品（已存在则数量 +1）
 * @property {Function} removeFromCart - 根据商品 ID 移除
 * @property {Function} updateQuantity - 更新某个商品的数量
 * @property {Function} clearCart - 清空购物车
 * @property {ComputedRef<number>} cartTotal - 购物车总价（计算属性）
 * @property {ComputedRef<number>} cartCount - 购物车商品总数（计算属性）
 */
export const useCart = () => {
  const cartItems = useState<CartItem[]>('cart', () => [])

  // 首次调用时从服务端拉取一次购物车数据
  const cartInitialized = useState<boolean>('cart-fetched', () => false)

  if (!cartInitialized.value) {
    const { data } = useFetch<CartItem[]>('/api/cart', {
      key: 'cart-data',
      server: false
    })

    watch(data, (newCart) => {
      if (newCart) {
        cartItems.value = newCart
      }
    }, { immediate: true })

    cartInitialized.value = true
  }

  const refreshCart = async () => {
    try {
      const fresh = await http.get<CartItem[]>('/cart')
      cartItems.value = fresh
    } catch (e) {
      console.error('Failed to refresh cart', e)
    }
  }

  /**
   * 将当前购物车状态持久化到服务端。
   * @async
   * @private
   */
  const saveCart = async () => {
    try {
      await http.post('/cart', cartItems.value)
    } catch (e) {
      console.error('Failed to save cart', e)
    }
  }

  /**
   * 添加商品到购物车。
   * 若商品已存在，则数量 +1。
   * 
   * @async
   * @param {Product} product - 要添加的商品
   */
  const addToCart = async (product: Product) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cartItems.value.push({ ...product, quantity: 1 })
    }
    await saveCart()
  }

  /**
   * 根据商品 ID 从购物车移除。
   * 
   * @async
   * @param {number} productId - 要移除的商品 ID
   */
  const removeFromCart = async (productId: number) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      await saveCart()
    }
  }

  /**
   * 更新购物车中某个商品的数量。
   * 数量最小为 1。
   * 
   * @async
   * @param {number} productId - 商品 ID
   * @param {number} quantity - 新数量
   */
  const updateQuantity = async (productId: number, quantity: number) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      await saveCart()
    }
  }

  /**
   * 清空购物车。
   * 
   * @async
   */
  const clearCart = async () => {
    cartItems.value = []
    await saveCart()
  }

  const cartTotal = computed(() => {
    // 以“分”为单位计算，避免浮点精度误差
    const totalInCents = cartItems.value.reduce((total, item) => {
      const priceInCents = Math.round(Number(item.price) * 100)
      return total + priceInCents * item.quantity
    }, 0)
    
    return Number((totalInCents / 100).toFixed(2))
  })

  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const resetCartLocal = () => {
    cartItems.value = []
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    resetCartLocal,
    refreshCart
  }
}

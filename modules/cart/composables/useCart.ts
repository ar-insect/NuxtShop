import type { Product } from '~/modules/product/composables/useProducts'

/**
 * Interface representing an item in the shopping cart.
 * Extends the Product interface with a quantity property.
 * @interface CartItem
 * @extends {Product}
 * @property {number} quantity - Number of units of this product in the cart
 */
export interface CartItem extends Product {
  quantity: number
}

/**
 * Composable for managing shopping cart state and operations.
 * Handles adding, removing, updating items, and syncing with the server.
 * 
 * @returns {Object} Cart state and methods
 * @property {Ref<CartItem[]>} cartItems - Reactive array of items in the cart
 * @property {Function} addToCart - Adds a product to the cart or increments quantity if exists
 * @property {Function} removeFromCart - Removes a product from the cart by ID
 * @property {Function} updateQuantity - Updates the quantity of a specific cart item
 * @property {Function} clearCart - Removes all items from the cart
 * @property {ComputedRef<number>} cartTotal - Computed total price of all items in cart
 * @property {ComputedRef<number>} cartCount - Computed total number of items in cart
 */
export const useCart = () => {
  const cartItems = useState<CartItem[]>('cart', () => [])

  // Sync with server
  const { data } = useFetch<CartItem[]>('/api/cart', {
    key: 'cart-data',
    server: false, // Client-side only to avoid double fetch with useState? No, we want SSR.
    // Actually, useFetch defaults to key based on url.
    // If we use useState, we want to hydrate it.
    lazy: true
  })

  // Watch for data changes from server
  watch(data, (newCart) => {
    if (newCart && cartItems.value.length === 0) {
      cartItems.value = newCart
    }
  }, { immediate: true })

  /**
   * Persists the current cart state to the server.
   * @async
   * @private
   */
  const saveCart = async () => {
    try {
      await $fetch('/api/cart', {
        method: 'POST',
        body: cartItems.value
      })
    } catch (e) {
      console.error('Failed to save cart', e)
    }
  }

  /**
   * Adds a product to the cart.
   * If the product already exists, increments its quantity.
   * 
   * @async
   * @param {Product} product - The product to add
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
   * Removes a product from the cart by its ID.
   * 
   * @async
   * @param {number} productId - The ID of the product to remove
   */
  const removeFromCart = async (productId: number) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      await saveCart()
    }
  }

  /**
   * Updates the quantity of a specific product in the cart.
   * Ensures quantity is at least 1.
   * 
   * @async
   * @param {number} productId - The ID of the product to update
   * @param {number} quantity - The new quantity value
   */
  const updateQuantity = async (productId: number, quantity: number) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      await saveCart()
    }
  }

  /**
   * Clears all items from the cart.
   * 
   * @async
   */
  const clearCart = async () => {
    cartItems.value = []
    await saveCart()
  }

  const cartTotal = computed(() => {
    // Calculate total in cents to avoid floating point precision errors
    const totalInCents = cartItems.value.reduce((total, item) => {
      const priceInCents = Math.round(Number(item.price) * 100)
      return total + priceInCents * item.quantity
    }, 0)
    
    return Number((totalInCents / 100).toFixed(2))
  })

  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const refreshCart = async () => {
    try {
      const latest = await $fetch<CartItem[]>('/api/cart')
      cartItems.value = Array.isArray(latest) ? latest : []
    } catch {
      cartItems.value = []
    }
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    refreshCart
  }
}

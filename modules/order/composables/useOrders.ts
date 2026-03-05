
import type { CartItem } from '~/modules/cart/composables/useCart'

/**
 * Interface representing a customer order.
 * @interface Order
 * @property {string} id - Unique order identifier
 * @property {CartItem[]} items - List of items in the order
 * @property {number} total - Total cost of the order
 * @property {string} status - Current status of the order (pending, processing, shipped, delivered, cancelled)
 * @property {string} date - ISO string of the order creation date
 * @property {Object} shippingAddress - Shipping information
 * @property {string} shippingAddress.name - Recipient name
 * @property {string} shippingAddress.phone - Recipient phone number
 * @property {string} shippingAddress.address - Full shipping address
 */
export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  shippingAddress: {
    name: string
    phone: string
    address: string
  }
}

/**
 * Composable for managing customer orders.
 * Handles creation, retrieval, and deletion of orders.
 * Syncs with localStorage on the client side.
 * 
 * @returns {Object} Order state and methods
 * @property {Ref<Order[]>} orders - Reactive array of orders
 * @property {Function} createOrder - Creates a new order
 * @property {Function} getOrderById - Retrieves an order by its ID
 * @property {Function} deleteOrder - Deletes an order by its ID
 */
export const useOrders = () => {
  const orders = useState<Order[]>('orders', () => [])

  // Sync with server
  const { data, refresh } = useFetch<Order[]>('/api/orders', {
    key: 'orders-data',
    lazy: true
  })

  watch(data, (newOrders) => {
    if (newOrders) {
      orders.value = newOrders
    }
  }, { immediate: true })

  /**
   * Creates a new order and adds it to the order list.
   * Generates a unique ID and timestamp.
   * 
   * @async
   * @param {CartItem[]} items - Items to include in the order
   * @param {number} total - Total cost of the order
   * @param {Order['shippingAddress']} address - Shipping address details
   * @returns {Promise<Order>} The newly created order object
   */
  const createOrder = async (items: CartItem[], total: number, address: Order['shippingAddress']) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items: [...items],
      total,
      status: 'pending',
      date: new Date().toISOString(),
      shippingAddress: address
    }
    
    try {
      await $fetch('/api/orders', {
        method: 'POST',
        body: newOrder
      })
      orders.value.unshift(newOrder)
      return newOrder
    } catch (e) {
      console.error('Failed to create order', e)
      throw e
    }
  }

  /**
   * Finds an order by its ID.
   * 
   * @param {string} id - The ID of the order to find
   * @returns {Order | undefined} The found order or undefined
   */
  const getOrderById = (id: string) => {
    return orders.value.find(o => o.id === id)
  }

  /**
   * Deletes an order by its ID.
   * Removes from both server (Redis) and local state.
   * 
   * @async
   * @param {string} id - The ID of the order to delete
   */
  const deleteOrder = async (id: string) => {
    // Delete from server (Redis)
    try {
      await $fetch(`/api/orders?id=${id}`, {
        method: 'DELETE'
      })
      // Delete locally
      orders.value = orders.value.filter(o => o.id !== id)
    } catch (e) {
      console.error('Failed to delete order from server', e)
    }
  }

  const resetOrdersLocal = () => {
    orders.value = []
  }

  return {
    orders,
    createOrder,
    getOrderById,
    deleteOrder,
    refreshOrders: refresh,
    resetOrdersLocal
  }
}

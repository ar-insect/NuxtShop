
import type { CartItem } from '~/modules/cart/composables/useCart'

/**
 * 表示一笔订单的数据结构。
 * @interface Order
 * @property {string} id - 订单唯一标识
 * @property {CartItem[]} items - 订单商品列表
 * @property {number} total - 订单总金额
 * @property {string} status - 订单状态（pending/processing/shipped/delivered/cancelled）
 * @property {string} date - 下单时间（ISO 字符串）
 * @property {Object} shippingAddress - 收货信息
 * @property {string} shippingAddress.name - 收货人姓名
 * @property {string} shippingAddress.phone - 收货人电话
 * @property {string} shippingAddress.address - 收货地址
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
 * 订单管理组合式函数。
 * 负责订单的创建、查询与删除，并与服务端同步数据。
 * 
 * @returns {Object} 订单状态与方法
 * @property {Ref<Order[]>} orders - 订单列表（响应式）
 * @property {Function} createOrder - 创建订单
 * @property {Function} getOrderById - 根据 ID 获取订单
 * @property {Function} deleteOrder - 删除订单
 */
export const useOrders = () => {
  const orders = useState<Order[]>('orders', () => [])

  // 与服务端同步
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
   * 创建订单并添加到订单列表中（同时写入服务端）。
   * 会生成订单 ID 与下单时间。
   * 
   * @async
   * @param {CartItem[]} items - 订单商品
   * @param {number} total - 订单总金额
   * @param {Order['shippingAddress']} address - 收货信息
   * @returns {Promise<Order>} 新创建的订单对象
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
   * 根据订单 ID 查找订单。
   * 
   * @param {string} id - 订单 ID
   * @returns {Order | undefined} 找到则返回订单，否则返回 undefined
   */
  const getOrderById = (id: string) => {
    return orders.value.find(o => o.id === id)
  }

  /**
   * 根据订单 ID 删除订单。
   * 同时从服务端与本地状态中移除。
   * 
   * @async
   * @param {string} id - 要删除的订单 ID
   */
  const deleteOrder = async (id: string) => {
    // 从服务端删除
    try {
      await $fetch(`/api/orders?id=${id}`, {
        method: 'DELETE'
      })
      // 从本地状态删除
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

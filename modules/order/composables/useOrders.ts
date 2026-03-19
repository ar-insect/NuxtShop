
import type { CartItem } from '~/modules/cart/composables/useCart'
import { http } from '~/utils/http'
import type { OrderSummary } from '~/types/api'

export type Order = OrderSummary

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

  // 首次调用时从服务端拉取一次订单数据
  const ordersInitialized = useState<boolean>('orders-fetched', () => false)

  if (!ordersInitialized.value) {
    const { data } = useFetch<Order[]>('/api/orders', {
      key: 'orders-data',
      lazy: true
    })

    watch(data, (newOrders) => {
      if (newOrders) {
        orders.value = newOrders
      }
    }, { immediate: true })

    ordersInitialized.value = true
  }

  const refreshOrders = async () => {
    try {
      const fresh = await http.get<Order[]>('/orders')
      orders.value = fresh
    } catch {
      // 刷新订单失败时静默处理，避免在控制台输出错误
    }
  }

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
  const createOrder = async (items: CartItem[], total: number, address: { name: string; phone: string; address: string }) => {
    const newOrder = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items: [...items],
      total,
      status: 'pending' as Order['status'],
      date: new Date().toISOString(),
      shippingAddress: address
    }
    
    try {
      await http.post('/orders', newOrder)
      orders.value.unshift({
        id: newOrder.id,
        total: newOrder.total,
        status: newOrder.status,
        date: newOrder.date
      })
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
      await http.delete('/orders', { id })
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
    refreshOrders,
    resetOrdersLocal
  }
}

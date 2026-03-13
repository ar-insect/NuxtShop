import type { Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'

/**
 * 浏览历史管理组合式函数。
 * 记录用户最近浏览的商品。
 * 
 * @returns {Object} 浏览历史状态与方法
 * @property {Ref<Product[]>} historyItems - 最近浏览商品列表（响应式）
 * @property {Function} fetchHistory - 从服务端获取历史记录
 * @property {Function} addToHistory - 添加一条历史记录
 * @property {Function} clearHistory - 清空浏览历史
 */
export const useHistory = () => {
  const historyItems = useState<Product[]>('history', () => [])

  // 在客户端触发时与服务端同步（避免 SSR 数据差异导致的水合不一致）
  // 历史记录属于用户维度，理论上可用 useAsyncData 做 SSR，但首屏 Cookie 会话可能更复杂
  // 这里统一使用客户端请求，保证导航时稳定且快速
  /**
   * 从服务端获取用户浏览历史，并更新 historyItems。
   * 
   * @async
   */
  const fetchHistory = async () => {
    try {
      const data = await http.get<Product[]>('/history')
      historyItems.value = data || []
    } catch (e) {
      console.error('Failed to fetch history:', e)
    }
  }

  /**
   * 添加商品到浏览历史。
   * 采用乐观更新，并将历史记录限制为 20 条。
   * 
   * @async
   * @param {Product} product - 要加入历史记录的商品
   */
  const addToHistory = async (product: Product) => {
    if (!product || !product.id) return

    // 乐观更新
    const index = historyItems.value.findIndex(item => item.id === product.id)
    if (index > -1) {
      historyItems.value.splice(index, 1)
    }
    historyItems.value.unshift(product)
    if (historyItems.value.length > 20) {
      historyItems.value = historyItems.value.slice(0, 20)
    }

    try {
      await http.post('/history/add', product)
    } catch (e) {
      console.error('Failed to add to history:', e)
      // 失败时是否回滚：对历史记录而言通常不关键，可忽略
    }
  }

  /**
   * 清空用户浏览历史。
   * 
   * @async
   */
  const clearHistory = async () => {
    historyItems.value = []
    try {
      await http.post('/history/clear')
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

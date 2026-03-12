
/**
 * 表示商品的数据结构。
 * @interface Product
 * @property {number} id - 商品唯一标识
 * @property {string} title - 商品名称
 * @property {number} price - 商品价格
 * @property {string} description - 商品描述
 * @property {string} category - 商品分类（如 "men's clothing"）
 * @property {string} image - 商品图片 URL
 * @property {Object} rating - 评分信息
 * @property {number} rating.rate - 平均评分
 * @property {number} rating.count - 评分人数
 */
import { http } from '~/utils/http'

export interface Product {
  id: number
  title: string
  price: number
  description: string
  detailHtml?: string
  category: string
  image: string
  images: string[]
  rating: {
    rate: number
    count: number
  }
}

/**
 * 商品数据访问组合式函数。
 * 通过 API 获取商品数据。
 * 
 * @returns {Object} 商品状态与方法
 * @property {Ref<Product[]>} products - 商品列表（响应式）
 * @property {Function} getProductById - 根据商品 ID 获取商品
 */
export const useProducts = () => {
  const products = useState<Product[]>('products-list', () => [])

  /**
   * 确保商品数据已加载
   */
  const ensureProducts = async () => {
    if (products.value.length === 0) {
      try {
        const data = await http.get<Product[]>('/products')
        products.value = data
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
  }

  /**
   * 根据商品 ID 获取单个商品。
   * 
   * @param {number} id - 商品 ID
   * @returns {Promise<Product | undefined>} 找到则返回商品，否则返回 undefined
   */
  const getProductById = async (id: number) => {
    await ensureProducts()
    return products.value.find(p => p.id === id)
  }

  /**
   * 获取分页商品列表（可选分类与搜索过滤）。
   * 
   * @param {number} page - 当前页码（从 1 开始）
   * @param {number} limit - 每页数量
   * @param {string} [category] - 分类过滤（可选）
   * @param {string} [query] - 搜索词（可选，匹配标题/描述）
   * @returns {Promise<{ items: Product[]; total: number }>} 分页数据与总数
   */
  const getProducts = async (page: number = 1, limit: number = 16, category?: string, query?: string) => {
    await ensureProducts()
    
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 16

    const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : ''
    const normalizedCategory = typeof category === 'string' && category.trim() ? category : undefined

    let filtered = products.value

    if (normalizedCategory) {
      filtered = filtered.filter(p => p.category === normalizedCategory)
    }

    if (normalizedQuery) {
      filtered = filtered.filter(p => {
        const title = p.title?.toLowerCase?.() || ''
        const desc = p.description?.toLowerCase?.() || ''
        return title.includes(normalizedQuery) || desc.includes(normalizedQuery)
      })
    }

    const total = filtered.length
    const start = (safePage - 1) * safeLimit
    const items = filtered.slice(start, start + safeLimit)

    return { items, total }
  }

  return {
    products,
    getProducts,
    getProductById
  }
}

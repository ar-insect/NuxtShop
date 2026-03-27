/**
 * 商品规格项
 */
export interface ProductSpec {
  label: string
  value: string
}

/**
 * 商品模型（前后端共享）
 */
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
  specs?: ProductSpec[]
}

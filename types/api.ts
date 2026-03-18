export type UserRole = 'admin' | 'user'

export type UserLanguage = 'zh-CN' | 'en-US'

export interface UserPublic {
  _id: string
  username: string
  role: UserRole
  name?: string
  avatar?: string
  phone?: string
  language?: UserLanguage
  timezone?: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderSummary {
  id: string
  total: number
  status: OrderStatus
  date: string
}

export interface OrderItem {
  id: number
  title: string
  image: string
  price: number
  quantity: number
  category?: string
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
  }
}

export interface AdItem {
  id: number
  image: string
  link: string
  altKey: string
}

export interface LoginResponse {
  token: string
  user: UserPublic
}

export interface MeResponse {
  user: UserPublic
}

export interface AdsResponse {
  items: AdItem[]
}

export type UserRole = 'admin' | 'user'

export type UserLanguage = 'zh-CN' | 'en-US'

export type ApiErrorCode =
  | 'AUTH_MISSING_CREDENTIALS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_REGISTER_MISSING_FIELDS'
  | 'AUTH_REGISTER_PASSWORD_MISMATCH'
  | 'AUTH_REGISTER_PASSWORD_WEAK'
  | 'AUTH_REGISTER_USERNAME_EXISTS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_FORBIDDEN'
  | 'USER_UPDATE_EMPTY'
  | 'USER_UPDATE_FAILED'
  | 'USER_NOT_FOUND'
  | 'ADDRESS_MISSING_FIELDS'
  | 'ADDRESS_INVALID_ID'
  | 'ADDRESS_NOT_FOUND'
  | 'ADDRESS_CREATE_FAILED'
  | 'ADDRESS_UPDATE_FAILED'
  | 'ADDRESS_DELETE_FAILED'
  | 'ADDRESS_SET_DEFAULT_FAILED'
  | 'ADDRESS_FETCH_FAILED'
  | 'REVIEW_MISSING_FIELDS'
  | 'REVIEW_CREATE_FAILED'
  | 'THEME_MISSING_CONFIG'
  | 'THEME_UPDATE_FAILED'
  | 'THEME_FETCH_FAILED'
  | 'CART_SAVE_FAILED'
  | 'ADS_MISSING_FIELDS'
  | 'ADS_INVALID_ID'
  | 'ADS_NOT_FOUND'
  | 'ADS_OPERATION_FAILED'
  | 'ADMIN_USER_MISSING_FIELDS'
  | 'ADMIN_USER_INVALID_ID'
  | 'ADMIN_USER_NOT_FOUND'
  | 'ADMIN_USER_OPERATION_FAILED'
  | 'ADMIN_USER_USERNAME_EXISTS'

export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: any
}

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

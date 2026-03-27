import type { Product } from '~/types/product'
import type { OrderDocument } from '~/types/order'

export type AdminProductListItem = Product

export interface AdminOrderListItem extends Omit<OrderDocument, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  _id?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AdminSearchQuery {
  keyword?: string
  field?: string
  status?: string
  page?: number
  limit?: number
}

export interface AdsSearchQuery {
  position?: string
  status?: 'ACTIVE' | 'INACTIVE'
  id?: number
  altKey?: string
  page?: number
  limit?: number
}

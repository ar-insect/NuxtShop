import type { ObjectId } from 'mongodb'
import type { OrderDetail } from '~/types/api'

export interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

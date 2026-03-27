import type { ObjectId } from 'mongodb'

export interface ReviewDocument {
  _id?: ObjectId
  productId: number
  userId: ObjectId
  username: string
  userAvatar?: string
  rating: number
  content: string
  createdAt: Date
}

export interface ReviewSummary {
  productId: number
  avgRating: number
  reviewCount: number
}

export interface ReviewQueryParams {
  page?: number
  limit?: number
  productId?: number
  rating?: number
  keyword?: string
}

export interface ReviewQueryResult {
  items: ReviewDocument[]
  total: number
}

import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

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

const COLLECTION_NAME = 'product_reviews'

export async function insertReview(doc: Omit<ReviewDocument, '_id'>): Promise<ReviewDocument> {
  const collection = getCollection<ReviewDocument>(COLLECTION_NAME)
  const result = await collection.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function findReviewsByProductId(productId: number, limit = 50): Promise<ReviewDocument[]> {
  const collection = getCollection<ReviewDocument>(COLLECTION_NAME)
  return collection
    .find({ productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export interface ReviewSummary {
  productId: number
  avgRating: number
  reviewCount: number
}

export async function getReviewSummaryByProductId(productId: number): Promise<ReviewSummary> {
  const collection = getCollection<ReviewDocument>(COLLECTION_NAME)

  const cursor = collection.aggregate<{ _id: number; avgRating: number; reviewCount: number }>([
    { $match: { productId } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ])

  const doc = await cursor.next()

  if (!doc) {
    return {
      productId,
      avgRating: 0,
      reviewCount: 0
    }
  }

  return {
    productId: doc._id,
    avgRating: doc.avgRating,
    reviewCount: doc.reviewCount
  }
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

export async function findReviewsWithFilters(params: ReviewQueryParams): Promise<ReviewQueryResult> {
  const collection = getCollection<ReviewDocument>(COLLECTION_NAME)

  const page = Number.isFinite(params.page) && (params.page || 0) > 0 ? Math.floor(params.page as number) : 1
  const limit = Number.isFinite(params.limit) && (params.limit || 0) > 0 ? Math.floor(params.limit as number) : 20
  const safeLimit = Math.min(limit, 100)
  const skip = (page - 1) * safeLimit

  const filter: Record<string, any> = {}

  if (typeof params.productId === 'number' && params.productId > 0) {
    filter.productId = params.productId
  }

  if (typeof params.rating === 'number' && params.rating > 0) {
    filter.rating = params.rating
  }

  const keyword = typeof params.keyword === 'string' ? params.keyword.trim() : ''
  if (keyword) {
    filter.content = { $regex: keyword, $options: 'i' }
  }

  const [items, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),
    collection.countDocuments(filter)
  ])

  return { items, total }
}

export async function deleteReviewById(id: ObjectId): Promise<boolean> {
  const collection = getCollection<ReviewDocument>(COLLECTION_NAME)
  const res = await collection.deleteOne({ _id: id })
  return res.deletedCount === 1
}

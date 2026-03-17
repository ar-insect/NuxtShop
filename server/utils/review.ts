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


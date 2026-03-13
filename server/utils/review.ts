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


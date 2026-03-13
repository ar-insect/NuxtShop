import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { Product } from '~/modules/product/composables/useProducts'

interface WishlistDocument {
  _id?: ObjectId
  userId: ObjectId
  items: Product[]
  updatedAt: Date
}

const COLLECTION_NAME = 'user_wishlists'

export async function findWishlistByUserId(userId: ObjectId): Promise<Product[]> {
  const collection = getCollection<WishlistDocument>(COLLECTION_NAME)
  const doc = await collection.findOne({ userId })
  return doc?.items || []
}

export async function saveWishlistForUser(userId: ObjectId, items: Product[]): Promise<void> {
  const collection = getCollection<WishlistDocument>(COLLECTION_NAME)
  const updatedAt = new Date()
  await collection.updateOne(
    { userId },
    {
      $set: {
        userId,
        items,
        updatedAt
      }
    },
    { upsert: true }
  )
}

export interface TopFavoritedProduct {
  productId: number
  product: Product
  favorites: number
  lastUpdatedAt: Date
}

export async function findTopFavoritedProducts(days: number, limit: number): Promise<TopFavoritedProduct[]> {
  const collection = getCollection<WishlistDocument>(COLLECTION_NAME)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const pipeline = [
    { $match: { updatedAt: { $gte: since } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.id',
        users: { $addToSet: '$userId' },
        lastUpdatedAt: { $max: '$updatedAt' },
        product: { $last: '$items' }
      }
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        product: 1,
        favorites: { $size: '$users' },
        lastUpdatedAt: 1
      }
    },
    { $sort: { favorites: -1, lastUpdatedAt: -1 } },
    { $limit: limit }
  ]

  const docs = await collection.aggregate<TopFavoritedProduct>(pipeline as any).toArray()
  return docs
}


import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { CartItem } from '~/modules/cart/composables/useCart'

interface CartDocument {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}

const COLLECTION_NAME = 'user_carts'

export async function findCartByUserId(userId: ObjectId): Promise<CartItem[]> {
  const collection = getCollection<CartDocument>(COLLECTION_NAME)
  const doc = await collection.findOne({ userId })
  return doc?.items || []
}

export async function saveCartForUser(userId: ObjectId, items: CartItem[]): Promise<void> {
  const collection = getCollection<CartDocument>(COLLECTION_NAME)
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


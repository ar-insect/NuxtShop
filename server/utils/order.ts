import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { Order } from '~/modules/order/composables/useOrders'

interface OrderDocument extends Order {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = 'user_orders'

export async function findOrdersByUserId(userId: ObjectId): Promise<Order[]> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
  return docs.map(({ userId: _userId, createdAt: _c, updatedAt: _u, ...rest }) => rest)
}

export async function insertOrder(userId: ObjectId, order: Order): Promise<void> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const now = new Date()
  await collection.insertOne({
    ...order,
    userId,
    createdAt: now,
    updatedAt: now
  })
}

export async function deleteOrderByUser(userId: ObjectId, orderId: string): Promise<boolean> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const result = await collection.deleteOne({ userId, id: orderId })
  return result.deletedCount === 1
}

export async function clearOrdersByUser(userId: ObjectId): Promise<void> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  await collection.deleteMany({ userId })
}


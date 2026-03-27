import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { OrderDetail } from '~/types/api'

interface OrderDocument extends OrderDetail {
  _id?: ObjectId
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = 'user_orders'

/**
 * 查询指定用户的订单列表（按创建时间倒序）
 * @param userId 用户的 ObjectId
 * @returns Promise<OrderDetail[]> 订单详情数组
 */
export async function findOrdersByUserId(userId: ObjectId): Promise<OrderDetail[]> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
  return docs.map(({ userId: _userId, createdAt: _c, updatedAt: _u, ...rest }) => rest)
}

/**
 * 为指定用户插入一条订单
 * @param userId 用户的 ObjectId
 * @param order 订单详情
 * @returns Promise<void>
 */
export async function insertOrder(userId: ObjectId, order: OrderDetail): Promise<void> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const now = new Date()
  await collection.insertOne({
    ...order,
    userId,
    createdAt: now,
    updatedAt: now
  })
}

/**
 * 删除用户的一条订单（按订单 id）
 * @param userId 用户的 ObjectId
 * @param orderId 订单编号
 * @returns Promise<boolean> 删除成功返回 true
 */
export async function deleteOrderByUser(userId: ObjectId, orderId: string): Promise<boolean> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  const result = await collection.deleteOne({ userId, id: orderId })
  return result.deletedCount === 1
}

/**
 * 清空用户的全部订单
 * @param userId 用户的 ObjectId
 * @returns Promise<void>
 */
export async function clearOrdersByUser(userId: ObjectId): Promise<void> {
  const collection = getCollection<OrderDocument>(COLLECTION_NAME)
  await collection.deleteMany({ userId })
}

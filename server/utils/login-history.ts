import { ObjectId } from 'mongodb'
import type { H3Event } from 'h3'
import { getCollection } from '~/server/utils/mongodb'

const COLLECTION_NAME = 'user_login_history'

export type LoginHistoryStatus = 'success' | 'failed'

export interface LoginHistoryDocument {
  _id?: ObjectId
  userId: ObjectId
  device: string
  ip: string
  status: LoginHistoryStatus
  createdAt: Date
}

const getLoginHistoryCollection = () => getCollection<LoginHistoryDocument>(COLLECTION_NAME)

/**
 * 记录一次用户登录历史（包含设备与 IP）
 * @param event H3Event（用于读取请求头）
 * @param userId 用户字符串形式 ObjectId
 * @param status 登录状态（默认 success）
 * @returns Promise<void>
 */
export async function insertLoginHistory(event: H3Event, userId: string, status: LoginHistoryStatus = 'success') {
  if (!ObjectId.isValid(userId)) return

  const collection = getLoginHistoryCollection()
  const uaHeader = event.node.req.headers['user-agent'] as string | undefined
  const device = uaHeader ? uaHeader.slice(0, 120) : 'Unknown'

  const ipHeader = (event.node.req.headers['x-forwarded-for'] as string | undefined) || ''
  const ipFromHeader = ipHeader.split(',')[0]?.trim()
  const ip = ipFromHeader || event.node.req.socket.remoteAddress || ''

  const doc: LoginHistoryDocument = {
    userId: new ObjectId(userId),
    device,
    ip,
    status,
    createdAt: new Date()
  }

  await collection.insertOne(doc)
}

/**
 * 查询用户最近的登录记录（按时间倒序）
 * @param userId 用户字符串形式 ObjectId
 * @param limit 返回条数（默认 10）
 * @returns Promise<LoginHistoryDocument[]>
 */
export async function findRecentLoginHistory(userId: string, limit = 10): Promise<LoginHistoryDocument[]> {
  if (!ObjectId.isValid(userId)) return []
  const collection = getLoginHistoryCollection()
  return collection
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

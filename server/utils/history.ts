import type { ObjectId, WithId, Filter } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

export interface HistoryDocument {
  _id?: ObjectId
  userId?: ObjectId | null
  sessionId?: string | null
  productId: number
  product: any
  viewedAt: Date
}

const COLLECTION_NAME = 'browse_history'

interface HistoryKey {
  userId?: ObjectId
  sessionId?: string
}

function buildOwnerFilter(key: HistoryKey): Filter<HistoryDocument> {
  if (key.userId) {
    return { userId: key.userId }
  }
  return { sessionId: key.sessionId || null }
}

export async function upsertHistoryEntry(key: HistoryKey, product: any, maxEntries = 20): Promise<void> {
  const collection = getCollection<HistoryDocument>(COLLECTION_NAME)

  const filter: Filter<HistoryDocument> = {
    productId: Number(product.id),
    ...(key.userId ? { userId: key.userId } : { sessionId: key.sessionId || null })
  }

  const doc: HistoryDocument = {
    userId: key.userId,
    sessionId: key.sessionId || null,
    productId: Number(product.id),
    product,
    viewedAt: new Date()
  }

  await collection.updateOne(filter, { $set: doc }, { upsert: true })

  const ownerFilter = buildOwnerFilter(key)
  const excess: WithId<HistoryDocument>[] = await collection
    .find(ownerFilter, { projection: { _id: 1 }, sort: { viewedAt: -1 }, skip: maxEntries })
    .toArray()

  if (excess.length > 0) {
    await collection.deleteMany({ _id: { $in: excess.map(d => d._id!) } })
  }
}

export async function findHistory(key: HistoryKey, limit = 20): Promise<HistoryDocument[]> {
  const collection = getCollection<HistoryDocument>(COLLECTION_NAME)
  const ownerFilter = buildOwnerFilter(key)

  return collection
    .find(ownerFilter)
    .sort({ viewedAt: -1 })
    .limit(limit)
    .toArray()
}

export async function clearHistory(key: HistoryKey): Promise<void> {
  const collection = getCollection<HistoryDocument>(COLLECTION_NAME)
  const ownerFilter = buildOwnerFilter(key)
  await collection.deleteMany(ownerFilter)
}

export interface TopViewedProduct {
  productId: number
  product: any
  views: number
  lastViewedAt: Date
}

export async function findTopViewedProducts(days: number, limit: number): Promise<TopViewedProduct[]> {
  const collection = getCollection<HistoryDocument>(COLLECTION_NAME)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const pipeline = [
    { $match: { viewedAt: { $gte: since } } },
    {
      $group: {
        _id: '$productId',
        views: { $sum: 1 },
        lastViewedAt: { $max: '$viewedAt' },
        product: { $last: '$product' }
      }
    },
    { $sort: { views: -1, lastViewedAt: -1 } },
    { $limit: limit }
  ]

  const docs = await collection.aggregate<any>(pipeline).toArray()

  return docs.map((d) => ({
    productId: d._id as number,
    product: d.product,
    views: d.views,
    lastViewedAt: d.lastViewedAt
  }))
}


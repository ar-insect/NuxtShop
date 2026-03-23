import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

export type CouponType = 'fixed' | 'percent'

export interface CouponDocument {
  _id?: ObjectId
  code: string
  name: string
  type: CouponType
  amount: number
  minOrderAmount: number
  startAt: Date | null
  endAt: Date | null
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = 'coupons_app'

const getCouponCollection = () => getCollection<CouponDocument>(COLLECTION_NAME)

export interface CouponQueryParams {
  page?: number
  limit?: number
  enabled?: boolean
  keyword?: string
}

export interface CouponQueryResult {
  items: CouponDocument[]
  total: number
}

export async function findCouponsWithFilters(params: CouponQueryParams): Promise<CouponQueryResult> {
  const collection = getCouponCollection()

  const page = Number.isFinite(params.page) && (params.page || 0) > 0 ? Math.floor(params.page as number) : 1
  const limit = Number.isFinite(params.limit) && (params.limit || 0) > 0 ? Math.floor(params.limit as number) : 20
  const safeLimit = Math.min(limit, 100)
  const skip = (page - 1) * safeLimit

  const filter: Record<string, any> = {}

  if (typeof params.enabled === 'boolean') {
    filter.enabled = params.enabled
  }

  const keyword = typeof params.keyword === 'string' ? params.keyword.trim() : ''
  if (keyword) {
    filter.$or = [
      { code: { $regex: keyword, $options: 'i' } },
      { name: { $regex: keyword, $options: 'i' } }
    ]
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

export async function createCoupon(payload: {
  code: string
  name: string
  type: CouponType
  amount: number
  minOrderAmount: number
  startAt?: Date | null
  endAt?: Date | null
  enabled?: boolean
}): Promise<CouponDocument | null> {
  const collection = getCouponCollection()

  const existing = await collection.findOne({ code: payload.code })
  if (existing) {
    return null
  }

  const now = new Date()

  const doc: CouponDocument = {
    code: payload.code,
    name: payload.name,
    type: payload.type,
    amount: payload.amount,
    minOrderAmount: payload.minOrderAmount,
    startAt: payload.startAt ?? null,
    endAt: payload.endAt ?? null,
    enabled: payload.enabled ?? true,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function updateCoupon(id: ObjectId, patch: Partial<CouponDocument>): Promise<CouponDocument | null> {
  const collection = getCouponCollection()

  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  return result.value
}

export async function deleteCoupon(id: ObjectId): Promise<boolean> {
  const collection = getCouponCollection()
  const res = await collection.deleteOne({ _id: id })
  return res.deletedCount === 1
}

export async function findEnabledCouponByCode(code: string): Promise<CouponDocument | null> {
  const collection = getCouponCollection()
  const now = new Date()

  return collection.findOne({
    code,
    enabled: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
    ]
  } as any)
}

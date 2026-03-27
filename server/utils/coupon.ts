import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { CouponDocument, CouponType } from '~/types/coupon'

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

/**
 * 按条件分页查询优惠券（支持启用状态与关键词）
 * @param params 查询参数：page、limit、enabled、keyword
 * @returns Promise<CouponQueryResult>
 */
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

/**
 * 创建优惠券（code 唯一，若已存在则返回 null）
 * @param payload 优惠券数据
 * @returns Promise<CouponDocument | null>
 */
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

/**
 * 更新优惠券（按 _id），返回更新后的文档
 * @param id 优惠券 ObjectId
 * @param patch 局部更新字段
 * @returns Promise<CouponDocument | null>
 */
export async function updateCoupon(id: ObjectId, patch: Partial<CouponDocument>): Promise<CouponDocument | null> {
  const collection = getCouponCollection()

  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  return result.value
}

/**
 * 删除优惠券（按 _id）
 * @param id 优惠券 ObjectId
 * @returns Promise<boolean> 删除成功返回 true
 */
export async function deleteCoupon(id: ObjectId): Promise<boolean> {
  const collection = getCouponCollection()
  const res = await collection.deleteOne({ _id: id })
  return res.deletedCount === 1
}

/**
 * 根据优惠码查询当前可用的有效优惠券（考虑启用与时间范围）
 * @param code 优惠码
 * @returns Promise<CouponDocument | null>
 */
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

export interface BestCouponResult {
  coupon: CouponDocument | null
  discount: number
}

/**
 * 根据订单金额计算“最佳可用优惠券”及折扣
 * 遍历当前启用且在有效期内的优惠券，返回折扣最大的一个
 * @param orderTotal 订单金额
 * @returns Promise<BestCouponResult>
 */
export async function findBestCouponForAmount(orderTotal: number): Promise<BestCouponResult> {
  const collection = getCouponCollection()
  const now = new Date()

  const candidates = await collection
    .find({
      enabled: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
      ]
    } as any)
    .toArray()

  if (!candidates.length || orderTotal <= 0) {
    return { coupon: null, discount: 0 }
  }

  let best: CouponDocument | null = null
  let bestDiscount = 0

  for (const c of candidates) {
    if (typeof c.minOrderAmount === 'number' && orderTotal < c.minOrderAmount) {
      continue
    }

    let d = 0
    if (c.type === 'fixed') {
      d = c.amount
    } else if (c.type === 'percent') {
      d = (orderTotal * c.amount) / 100
    }

    if (d <= 0) continue

    if (d > orderTotal) {
      d = orderTotal
    }

    if (d > bestDiscount) {
      bestDiscount = d
      best = c
    }
  }

  return {
    coupon: best,
    discount: Number(bestDiscount.toFixed(2))
  }
}

/**
 * 统计当前可用（启用且在有效期内）的优惠券数量
 * @returns Promise<number>
 */
export async function countAvailableCoupons(): Promise<number> {
  const collection = getCouponCollection()
  const now = new Date()

  return collection.countDocuments({
    enabled: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
    ]
  } as any)
}

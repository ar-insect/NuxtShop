export type CouponType = 'fixed' | 'percent'

export interface CouponDocument {
  _id?: import('mongodb').ObjectId
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

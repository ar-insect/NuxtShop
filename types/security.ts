import type { ObjectId } from 'mongodb'

export type LoginHistoryStatus = 'success' | 'failed'

export interface LoginHistoryDocument {
  _id?: ObjectId
  userId: ObjectId
  device: string
  ip: string
  status: LoginHistoryStatus
  createdAt: Date
}

export interface TwoFactorCode {
  _id?: ObjectId
  userId: ObjectId
  code: string
  expiresAt: Date
  used: boolean
}

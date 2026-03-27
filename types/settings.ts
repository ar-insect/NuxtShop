import type { ObjectId } from 'mongodb'

export interface ShippingSetting {
  baseFee: number
  freeThreshold: number | null
}

export interface PaymentSetting {
  alipay: boolean
  wechat: boolean
  creditCard: boolean
}

export interface SystemSettingsDocument {
  _id?: ObjectId
  key: 'global'
  shipping: ShippingSetting
  payments: PaymentSetting
  updatedAt: Date
}

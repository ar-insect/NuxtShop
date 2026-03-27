import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

interface ShippingSetting {
  baseFee: number
  freeThreshold: number | null
}

interface PaymentSetting {
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

const COLLECTION_NAME = 'system_settings_app'

const getSettingsCollection = () => getCollection<SystemSettingsDocument>(COLLECTION_NAME)

const DEFAULT_SETTINGS: SystemSettingsDocument = {
  key: 'global',
  shipping: {
    baseFee: 0,
    freeThreshold: null
  },
  payments: {
    alipay: true,
    wechat: true,
    creditCard: true
  },
  updatedAt: new Date()
}

/**
 * 获取系统配置（若不存在则初始化默认配置并返回）
 * @returns Promise<SystemSettingsDocument>
 */
export async function getSystemSettings(): Promise<SystemSettingsDocument> {
  const collection = getSettingsCollection()
  let doc = await collection.findOne({ key: 'global' })

  if (!doc) {
    const res = await collection.insertOne(DEFAULT_SETTINGS)
    doc = { ...DEFAULT_SETTINGS, _id: res.insertedId }
  }

  return doc
}

/**
 * 更新系统配置（仅允许 shipping / payments 字段）
 * @param partial 局部更新的配置
 * @returns Promise<SystemSettingsDocument> 更新后的配置
 */
export async function updateSystemSettings(partial: Partial<SystemSettingsDocument>): Promise<SystemSettingsDocument> {
  const collection = getSettingsCollection()

  const now = new Date()
  const $set: Partial<SystemSettingsDocument> = { updatedAt: now }

  if (partial.shipping) {
    $set.shipping = {
      baseFee: typeof partial.shipping.baseFee === 'number' ? partial.shipping.baseFee : DEFAULT_SETTINGS.shipping.baseFee,
      freeThreshold: typeof partial.shipping.freeThreshold === 'number' ? partial.shipping.freeThreshold : null
    }
  }

  if (partial.payments) {
    const current = DEFAULT_SETTINGS.payments
    $set.payments = {
      alipay: typeof partial.payments.alipay === 'boolean' ? partial.payments.alipay : current.alipay,
      wechat: typeof partial.payments.wechat === 'boolean' ? partial.payments.wechat : current.wechat,
      creditCard: typeof partial.payments.creditCard === 'boolean' ? partial.payments.creditCard : current.creditCard
    }
  }

  const result = await collection.findOneAndUpdate(
    { key: 'global' },
    { $set },
    { returnDocument: 'after', upsert: true }
  )

  return (result.value as SystemSettingsDocument) || (await getSystemSettings())
}

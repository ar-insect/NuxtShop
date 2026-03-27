import { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { TwoFactorCode } from '~/types/security'

const COLLECTION_NAME = 'user_two_factor_codes'

const getTwoFactorCollection = () => getCollection<TwoFactorCode>(COLLECTION_NAME)

/**
 * 为用户生成一次性 6 位手机验证码（有效期 5 分钟）
 * @param userId 用户字符串形式 ObjectId
 * @returns Promise<string> 生成的验证码；入参非法时返回空字符串
 */
export async function createTwoFactorCode(userId: string): Promise<string> {
  if (!ObjectId.isValid(userId)) return ''

  const collection = getTwoFactorCollection()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await collection.insertOne({
    userId: new ObjectId(userId),
    code,
    expiresAt,
    used: false
  })

  return code
}

/**
 * 校验用户的两步验证码（有效期内且未使用）
 * 验证通过后会将该验证码标记为已使用
 * @param userId 用户字符串形式 ObjectId
 * @param code 验证码字符串
 * @returns Promise<boolean> 验证通过返回 true
 */
export async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false
  const collection = getTwoFactorCollection()
  const doc = await collection.findOne({
    userId: new ObjectId(userId),
    code,
    used: false,
    expiresAt: { $gt: new Date() }
  } as any)

  if (!doc) return false

  await collection.updateOne({ _id: doc._id }, { $set: { used: true } })
  return true
}

/**
 * 脱敏显示手机号（保留前三位与后四位，中间替换为 *）
 * @param phone 原始手机号
 * @returns string 脱敏后的字符串
 */
export const maskPhone = (phone: string | undefined) => {
  if (!phone) return ''
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

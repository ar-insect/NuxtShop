import { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

const COLLECTION_NAME = 'user_two_factor_codes'

interface TwoFactorCode {
  _id?: ObjectId
  userId: ObjectId
  code: string
  expiresAt: Date
  used: boolean
}

const getTwoFactorCollection = () => getCollection<TwoFactorCode>(COLLECTION_NAME)

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

export const maskPhone = (phone: string | undefined) => {
  if (!phone) return ''
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}


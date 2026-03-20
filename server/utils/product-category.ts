import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'

const COLLECTION_NAME = 'product_categories'

interface ProductCategoryDocument {
  _id?: ObjectId
  key: string
  label: string
  slug?: string
  parentKey?: string
  order: number
  active: boolean
  icon?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export const getCategoryCollection = () => getCollection<ProductCategoryDocument>(COLLECTION_NAME)

export async function findAllCategoriesAdmin() {
  const col = getCategoryCollection()
  return col.find({}).sort({ order: 1, key: 1 }).toArray()
}

export async function findActiveCategoriesPublic() {
  const col = getCategoryCollection()
  return col
    .find({ active: true })
    .sort({ order: 1, key: 1 })
    .project<{ key: string; label: string }>({ key: 1, label: 1, _id: 0 })
    .toArray()
}

export async function createCategory(payload: {
  key: string
  label: string
  parentKey?: string
  order?: number
}) {
  const col = getCategoryCollection()

  const existing = await col.findOne({ key: payload.key })
  if (existing) {
    return null
  }

  const now = new Date()
  const doc: ProductCategoryDocument = {
    key: payload.key,
    label: payload.label,
    parentKey: payload.parentKey,
    order: typeof payload.order === 'number' ? payload.order : Date.now(),
    active: true,
    createdAt: now,
    updatedAt: now
  }

  const res = await col.insertOne(doc)
  return { ...doc, _id: res.insertedId }
}

export async function updateCategory(id: ObjectId, patch: Partial<ProductCategoryDocument>) {
  const col = getCategoryCollection()
  const now = new Date()
  const toSet: Partial<ProductCategoryDocument> = { ...patch, updatedAt: now }
  const result = await col.findOneAndUpdate(
    { _id: id },
    { $set: toSet },
    { returnDocument: 'after' }
  )
  return result.value
}

export async function deleteCategory(id: ObjectId) {
  const col = getCategoryCollection()
  const result = await col.deleteOne({ _id: id })
  return result.deletedCount === 1
}


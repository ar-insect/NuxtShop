import type { ObjectId, Filter } from 'mongodb'
import { connectToMongoDB, getCollection } from '~/server/utils/mongodb'
import type { Product as SeedProduct } from '~/server/data/products'
import { products as seedProducts } from '~/server/data/products'

type DbProduct = SeedProduct & { _id?: ObjectId }

const COLLECTION_NAME = 'shop_products_app'

async function ensureProductsSeeded() {
  await connectToMongoDB()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)

  const count = await collection.countDocuments()
  if (count === 0) {
    await collection.insertMany(seedProducts.map((p) => ({ ...p })))
  }
}

export async function findAllProducts(): Promise<DbProduct[]> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  return collection.find({}).sort({ id: 1 }).toArray()
}

export async function findProductById(id: number): Promise<DbProduct | null> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  return collection.findOne({ id })
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  category?: string
  query?: string
  sort?: 'default' | 'price-asc' | 'price-desc' | 'rating-desc'
}

export interface ProductQueryResult {
  items: DbProduct[]
  total: number
}

export async function findProductsWithFilters(params: ProductQueryParams): Promise<ProductQueryResult> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)

  const page = Number.isFinite(params.page) && (params.page || 0) > 0 ? Math.floor(params.page as number) : 1
  const limit = Number.isFinite(params.limit) && (params.limit || 0) > 0 ? Math.floor(params.limit as number) : 16
  const safeLimit = Math.min(limit, 100)

  const filter: Filter<DbProduct> = {}

  const category = typeof params.category === 'string' && params.category.trim() ? params.category.trim() : undefined
  if (category) {
    filter.category = category
  }

  const q = typeof params.query === 'string' ? params.query.trim() : ''
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ] as any
  }

  const skip = (page - 1) * safeLimit
  const sortKey = params.sort || 'default'

  if (sortKey === 'rating-desc') {
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'product_reviews',
          localField: 'id',
          foreignField: 'productId',
          as: 'reviewDocs'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviewDocs' },
          avgRating: {
            $cond: [
              { $gt: [{ $size: '$reviewDocs' }, 0] },
              { $avg: '$reviewDocs.rating' },
              '$rating.rate'
            ]
          }
        }
      },
      {
        $addFields: {
          ratingScore: {
            $cond: [
              { $gt: ['$reviewCount', 0] },
              {
                $multiply: [
                  '$avgRating',
                  { $log10: { $add: ['$reviewCount', 10] } }
                ]
              },
              {
                $multiply: [
                  '$rating.rate',
                  { $log10: { $add: ['$rating.count', 10] } }
                ]
              }
            ]
          },
          'rating.rate': '$avgRating',
          'rating.count': '$reviewCount'
        }
      },
      { $sort: { ratingScore: -1, id: 1 } },
      { $skip: skip },
      { $limit: safeLimit },
      { $project: { reviewDocs: 0, reviewCount: 0, avgRating: 0, ratingScore: 0 } }
    ]

    const [items, total] = await Promise.all([
      collection.aggregate<DbProduct>(pipeline).toArray(),
      collection.countDocuments(filter)
    ])

    return { items, total }
  }

  let sort: Record<string, 1 | -1> = { id: 1 }
  if (sortKey === 'price-asc') {
    sort = { price: 1, id: 1 }
  } else if (sortKey === 'price-desc') {
    sort = { price: -1, id: 1 }
  }

  const [items, total] = await Promise.all([
    collection.find(filter).sort(sort).skip(skip).limit(safeLimit).toArray(),
    collection.countDocuments(filter)
  ])

  return { items, total }
}

export async function findAllCategories(): Promise<string[]> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  const categories = await collection.distinct('category')
  return categories.filter((c): c is string => typeof c === 'string')
}

import type { ObjectId, Filter } from 'mongodb'
import { connectToMongoDB, getCollection } from '~/server/utils/mongodb'
import type { Product as SeedProduct } from '~/server/data/products'
import { products as seedProducts } from '~/server/data/products'

type DbProduct = SeedProduct & { _id?: ObjectId }

const COLLECTION_NAME = 'shop_products_app'

/**
 * 确保商品集合完成首批种子数据初始化
 * 当集合为空时，插入 server/data/products 中的示例商品
 * @returns Promise<void>
 */
async function ensureProductsSeeded() {
  await connectToMongoDB()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)

  const count = await collection.countDocuments()
  if (count === 0) {
    await collection.insertMany(seedProducts.map((p) => ({ ...p })))
  }
}

/**
 * 获取所有商品（按 id 升序）
 * @returns Promise<DbProduct[]>
 */
export async function findAllProducts(): Promise<DbProduct[]> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  return collection.find({}).sort({ id: 1 }).toArray()
}

/**
 * 根据商品 id 查询单个商品
 * @param id 商品数字 ID
 * @returns Promise<DbProduct | null> 找不到时返回 null
 */
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

/**
 * 按条件分页查询商品（支持分类/关键词/排序）
 * 当 sort 为 'rating-desc' 时，会使用 product_reviews 集合计算综合评分并排序
 * @param params 查询参数：page、limit、category、query、sort
 * @returns Promise<ProductQueryResult>
 */
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

/**
 * 返回去重后的商品分类（字符串数组）
 * @returns Promise<string[]>
 */
export async function findAllCategories(): Promise<string[]> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  const categories = await collection.distinct('category')
  return categories.filter((c): c is string => typeof c === 'string')
}

/**
 * 创建新商品（自动生成递增 id，rating 可选）
 * @param payload 商品字段（不含 id）；rating 可选，默认 { rate: 0, count: 0 }
 * @returns Promise<DbProduct> 插入后的文档
 */
export async function createProduct(payload: Omit<SeedProduct, 'id' | 'rating'> & Partial<Pick<SeedProduct, 'rating'>>): Promise<DbProduct> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)

  const last = await collection.find({}).sort({ id: -1 }).limit(1).toArray()
  const nextId = (last[0]?.id || 0) + 1

  const rating = payload.rating || { rate: 0, count: 0 }

  const doc: DbProduct = {
    ...payload,
    id: nextId,
    rating
  }

  await collection.insertOne(doc)
  return doc
}

/**
 * 根据商品 id 更新部分字段并返回更新后的文档
 * @param id 商品数字 ID
 * @param patch 局部更新字段
 * @returns Promise<DbProduct | null> 找不到时返回 null
 */
export async function updateProduct(id: number, patch: Partial<SeedProduct>): Promise<DbProduct | null> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: patch },
    { returnDocument: 'after' }
  )

  return result.value || null
}

/**
 * 根据商品 id 删除商品
 * @param id 商品数字 ID
 * @returns Promise<boolean> 成功删除返回 true
 */
export async function deleteProduct(id: number): Promise<boolean> {
  await ensureProductsSeeded()
  const collection = getCollection<DbProduct>(COLLECTION_NAME)
  const result = await collection.deleteOne({ id })
  return result.deletedCount === 1
}

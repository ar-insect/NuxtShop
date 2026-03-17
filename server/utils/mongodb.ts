import { MongoClient, type Db, type Collection, type Filter, type UpdateFilter, type FindOptions, type InsertOneOptions, type UpdateOptions, type DeleteOptions, type WithId, type OptionalUnlessRequiredId, type ObjectId } from 'mongodb'
import { useRuntimeConfig } from '#imports'

// 定义通用的文档类型，包含可选的 _id 字段
type Document = Record<string, any> & { _id?: ObjectId }

// MongoDB 客户端实例
let client: MongoClient | null = null
// 数据库实例
let db: Db | null = null

/**
 * 连接到 MongoDB 数据库
 * 如果已连接，则返回现有数据库实例
 * @returns Promise<Db> 数据库实例
 */
export async function connectToMongoDB(): Promise<Db> {
  // 如果数据库实例已存在，直接返回
  if (db) {
    return db
  }

  // 获取 Nuxt 运行时配置
  const config = useRuntimeConfig()
  const uri = config.mongodb.uri
  const dbName = config.mongodb.dbName

  // 检查连接 URI 和数据库名称是否已定义
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in runtimeConfig.')
  }
  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not defined in runtimeConfig.')
  }

  try {
    // 创建 MongoDB 客户端并连接
    client = new MongoClient(uri)
    await client.connect()
    // 获取数据库实例
    db = client.db(dbName)
    console.log('Connected to MongoDB successfully!')
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

/**
 * 获取已连接的数据库实例
 * @returns Db 数据库实例
 * @throws Error 如果数据库未连接
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB first.')
  }
  return db
}

/**
 * 获取指定名称的集合实例
 * @param collectionName 集合名称
 * @returns Collection<T> 集合实例
 */
export function getCollection<T extends Document>(collectionName: string): Collection<T> {
  return getDb().collection<T>(collectionName)
}

// --- CRUD 操作封装 ---

/**
 * 查找多个文档
 * @param collectionName 集合名称
 * @param filter 查询条件
 * @param options 查询选项
 * @returns Promise<WithId<T>[]> 文档数组
 */
export async function find<T extends Document>(
  collectionName: string,
  filter: Filter<T> = {},
  options?: FindOptions<T>
): Promise<WithId<T>[]> {
  return getCollection<T>(collectionName).find(filter, options).toArray()
}

/**
 * 查找单个文档
 * @param collectionName 集合名称
 * @param filter 查询条件
 * @param options 查询选项
 * @returns Promise<WithId<T> | null> 单个文档或 null
 */
export async function findOne<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  options?: FindOptions<T>
): Promise<WithId<T> | null> {
  return getCollection<T>(collectionName).findOne(filter, options)
}

/**
 * 插入单个文档
 * @param collectionName 集合名称
 * @param doc 要插入的文档
 * @param options 插入选项
 * @returns Promise<InsertOneResult<T>> 插入结果
 */
export async function insertOne<T extends Document>(
  collectionName: string,
  doc: OptionalUnlessRequiredId<T>,
  options?: InsertOneOptions
) {
  return getCollection<T>(collectionName).insertOne(doc, options)
}

/**
 * 更新单个文档
 * @param collectionName 集合名称
 * @param filter 更新条件
 * @param update 更新操作
 * @param options 更新选项
 * @returns Promise<UpdateResult> 更新结果
 */
export async function updateOne<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  update: UpdateFilter<T> | Partial<T>,
  options?: UpdateOptions
) {
  return getCollection<T>(collectionName).updateOne(filter, update, options)
}

/**
 * 更新多个文档
 * @param collectionName 集合名称
 * @param filter 更新条件
 * @param update 更新操作
 * @param options 更新选项
 * @returns Promise<UpdateResult> 更新结果
 */
export async function updateMany<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  update: UpdateFilter<T> | Partial<T>,
  options?: UpdateOptions
) {
  return getCollection<T>(collectionName).updateMany(filter, update, options)
}

/**
 * 删除单个文档
 * @param collectionName 集合名称
 * @param filter 删除条件
 * @param options 删除选项
 * @returns Promise<DeleteResult> 删除结果
 */
export async function deleteOne<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  options?: DeleteOptions
) {
  return getCollection<T>(collectionName).deleteOne(filter, options)
}

/**
 * 删除多个文档
 * @param collectionName 集合名称
 * @param filter 删除条件
 * @param options 删除选项
 * @returns Promise<DeleteResult> 删除结果
 */
export async function deleteMany<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  options?: DeleteOptions
) {
  return getCollection<T>(collectionName).deleteMany(filter, options)
}

/**
 * 关闭 MongoDB 数据库连接
 */
export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('MongoDB connection closed.')
  }
}


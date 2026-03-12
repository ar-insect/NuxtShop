import { MongoClient, type Db } from 'mongodb'
import { useRuntimeConfig } from '#imports'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()
  const uri = config.mongodb.uri
  const dbName = config.mongodb.dbName

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in runtimeConfig.')
  }
  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not defined in runtimeConfig.')
  }

  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db(dbName)
    console.log('Connected to MongoDB successfully!')
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB first.')
  }
  return db
}

export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('MongoDB connection closed.')
  }
}

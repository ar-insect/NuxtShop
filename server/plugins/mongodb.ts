import { defineNitroPlugin } from 'nitropack/runtime'
import { connectToMongoDB, closeMongoDBConnection } from '../utils/mongodb'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    await connectToMongoDB()
    console.log('MongoDB connection established for Nitro.')
  } catch (error) {
    console.error('Failed to establish MongoDB connection for Nitro:', error)
    // 在生产环境中，连接失败可能需要终止应用启动
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }

  nitroApp.hooks.hook('close', async () => {
    await closeMongoDBConnection()
    console.log('MongoDB connection closed by Nitro.')
  })
})

import { defineNitroPlugin } from 'nitropack/runtime'
import { getRequestURL, setResponseHeader, setResponseStatus } from 'h3'
import { connectToMongoDB, closeMongoDBConnection } from '../utils/mongodb'

export default defineNitroPlugin(async (nitroApp) => {
  const previousOnError = nitroApp.h3App.options.onError
  nitroApp.h3App.options.debug = false
  nitroApp.h3App.options.onError = async (error, event) => {
    if (event.path?.startsWith('/api/')) {
      const statusCode = error.statusCode || 500
      const statusMessage = error.statusMessage || 'Internal Server Error'
      const errorData = error.data as Record<string, unknown> | undefined
      const message = typeof errorData?.message === 'string'
        ? errorData.message
        : error.message || statusMessage

      event._handled = true
      setResponseStatus(event, statusCode, statusMessage)
      setResponseHeader(event, 'content-type', 'application/json; charset=utf-8')
      event.node.res.end(JSON.stringify({
        error: true,
        url: getRequestURL(event).toString(),
        statusCode,
        statusMessage,
        message,
        data: errorData
      }))
      return
    }

    if (previousOnError) {
      await previousOnError(error, event)
    }
  }

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

import { randomUUID } from 'crypto'
import { useRedis } from '~/server/utils/redis'
import { createError, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded'
    })
  }

  const file = formData[0]
  if (!file.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file'
    })
  }

  // Save avatar binary to Redis instead of filesystem
  const redis = useRedis()
  if (!redis) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Redis service unavailable'
    })
  }

  // Generate unique filename
  const id = randomUUID()
  const binKey = `avatar:bin:${id}`
  const metaKey = `avatar:meta:${id}`

  // Store binary and metadata
  await redis.set(binKey, file.data as any) // ioredis supports Buffer
  await redis.set(metaKey, JSON.stringify({
    filename: file.filename,
    type: file.type || 'image/jpeg',
    size: (file.data as any)?.length || 0,
    createdAt: new Date().toISOString()
  }))

  return {
    code: 200,
    message: 'File uploaded successfully',
    data: {
      // Expose a virtual URL served from Redis
      url: `/api/avatar/${id}`
    }
  }
})

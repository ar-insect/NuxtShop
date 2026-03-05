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
  if (!file || !file.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file'
    })
  }

  // 将头像二进制数据保存到 Redis（不落盘到文件系统）
  const redis = useRedis()
  if (!redis) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Redis service unavailable'
    })
  }

  // 生成唯一文件标识
  const id = randomUUID()
  const binKey = `avatar:bin:${id}`
  const metaKey = `avatar:meta:${id}`

  // 存储二进制数据与元数据
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
      // 返回一个由 Redis 数据提供的虚拟访问地址
      url: `/api/avatar/${id}`
    }
  }
})

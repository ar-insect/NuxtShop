import { send, createError } from 'h3'
import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing avatar id' })
  }

  const redis = useRedis()
  if (!redis) {
    throw createError({ statusCode: 503, statusMessage: 'Redis service unavailable' })
  }

  const binKey = `avatar:bin:${id}`
  const metaKey = `avatar:meta:${id}`

  // Fetch binary buffer and metadata
  const [buf, metaStr] = await Promise.all([
    redis.getBuffer(binKey),
    redis.get(metaKey)
  ])

  if (!buf) {
    throw createError({ statusCode: 404, statusMessage: 'Avatar not found' })
  }

  let contentType = 'image/jpeg'
  try {
    if (metaStr) {
      const meta = JSON.parse(metaStr)
      if (meta?.type) contentType = meta.type
    }
  } catch {}

  return send(event, buf, contentType)
})

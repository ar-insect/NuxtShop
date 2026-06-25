import type { H3Event } from 'h3'
import { getHeader, getRequestIP } from 'h3'
import { useRedis } from '~/server/utils/redis'

type ServerLogPayload = {
  type: string
  message: string
  level?: 'info' | 'warn' | 'error'
  action?: string
  userId?: string | null
  sessionId?: string | null
  previousSessionId?: string | null
  details?: Record<string, unknown> | null
}

const maskSessionId = (sessionId: string | null | undefined) => {
  if (!sessionId) {
    return null
  }

  if (sessionId.length <= 8) {
    return sessionId
  }

  return `${sessionId.slice(0, 4)}...${sessionId.slice(-4)}`
}

export const writeServerLog = async (event: H3Event, payload: ServerLogPayload) => {
  try {
    const redis = useRedis()
    const entry = {
      ...payload,
      level: payload.level || 'info',
      userId: payload.userId || null,
      sessionId: maskSessionId(payload.sessionId),
      previousSessionId: maskSessionId(payload.previousSessionId),
      details: payload.details || null,
      path: event.path,
      method: event.method,
      ip: getRequestIP(event) || 'unknown',
      userAgent: getHeader(event, 'user-agent') || 'unknown',
      serverTimestamp: new Date().toISOString()
    }

    await redis.lpush('app:logs', JSON.stringify(entry))
    await redis.ltrim('app:logs', 0, 999)
  } catch (error) {
    console.error('Failed to save server log to Redis:', error)
  }
}

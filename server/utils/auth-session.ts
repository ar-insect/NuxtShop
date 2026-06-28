import type { H3Event } from 'h3'
import { randomUUID } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { useRedis } from '~/server/utils/redis'
import { writeServerLog } from './server-log'

export const AUTH_SESSION_COOKIE_NAME = 'ns_auth_session'

const AUTH_SESSION_KEY_PREFIX = 'auth:session:'
const AUTH_SESSION_SLIDING_MAX_AGE = 60 * 60 * 24 * 3
const AUTH_SESSION_ABSOLUTE_MAX_AGE = 60 * 60 * 24 * 14

type AuthSessionRecord = {
  id: string
  userId: string
  createdAt: number
  lastAccessAt: number
  absoluteExpiresAt: number
}

const getSessionKey = (sessionId: string) => `${AUTH_SESSION_KEY_PREFIX}${sessionId}`

const getCookieOptions = (maxAge: number) => ({
  path: '/',
  maxAge,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
})

const getExpiredCookieOptions = () => ({
  path: '/',
  maxAge: 0,
  expires: new Date(0),
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
})

const clearLegacyAuthTokenCookie = (event: H3Event) => {
  setCookie(event, 'auth-token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
}

const clearAuthSessionCookie = (event: H3Event) => {
  setCookie(event, AUTH_SESSION_COOKIE_NAME, '', getExpiredCookieOptions())
}

const cacheAuthSession = (event: H3Event, session: AuthSessionRecord | null) => {
  event.context.authSession = session
  event.context.authSessionLoaded = true
  return session
}

const getRemainingAbsoluteAgeSeconds = (session: Pick<AuthSessionRecord, 'absoluteExpiresAt'>, now: number) => {
  return Math.floor((session.absoluteExpiresAt - now) / 1000)
}

const getSessionTtlSeconds = (session: Pick<AuthSessionRecord, 'absoluteExpiresAt'>, now: number) => {
  const remainingAbsoluteAge = getRemainingAbsoluteAgeSeconds(session, now)
  if (remainingAbsoluteAge <= 0) {
    return null
  }

  return Math.min(AUTH_SESSION_SLIDING_MAX_AGE, remainingAbsoluteAge)
}

export const getAuthSessionId = (event: H3Event) => {
  return getCookie(event, AUTH_SESSION_COOKIE_NAME) || null
}

export const createAuthSession = async (event: H3Event, userId: string) => {
  const redis = useRedis()
  const existingSessionId = getAuthSessionId(event)

  if (existingSessionId) {
    await redis.del(getSessionKey(existingSessionId))
  }

  const now = Date.now()
  const session: AuthSessionRecord = {
    id: randomUUID(),
    userId,
    createdAt: now,
    lastAccessAt: now,
    absoluteExpiresAt: now + AUTH_SESSION_ABSOLUTE_MAX_AGE * 1000
  }
  const ttlSeconds = getSessionTtlSeconds(session, now)

  if (!ttlSeconds) {
    throw new Error('Failed to calculate auth session ttl')
  }

  await redis.set(getSessionKey(session.id), JSON.stringify(session), 'EX', ttlSeconds)
  setCookie(event, AUTH_SESSION_COOKIE_NAME, session.id, getCookieOptions(ttlSeconds))
  clearLegacyAuthTokenCookie(event)
  await writeServerLog(event, {
    type: 'Auth Session',
    action: 'login',
    message: 'Created auth session',
    userId,
    sessionId: session.id,
    previousSessionId: existingSessionId,
    details: {
      replacedExistingSession: Boolean(existingSessionId)
    }
  })

  return cacheAuthSession(event, session)
}

export const destroyAuthSession = async (event: H3Event) => {
  const redis = useRedis()
  const sessionId = getAuthSessionId(event)
  const cachedSession = event.context.authSessionLoaded
    ? event.context.authSession || null
    : null
  let userId = cachedSession?.userId || null

  if (sessionId) {
    if (!userId) {
      const raw = await redis.get(getSessionKey(sessionId))
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AuthSessionRecord>
          userId = typeof parsed.userId === 'string' ? parsed.userId : null
        } catch {
          userId = null
        }
      }
    }

    await redis.del(getSessionKey(sessionId))
  }

  clearAuthSessionCookie(event)
  clearLegacyAuthTokenCookie(event)
  cacheAuthSession(event, null)
  await writeServerLog(event, {
    type: 'Auth Session',
    action: 'logout',
    message: sessionId ? 'Destroyed auth session' : 'Cleared auth session cookie without active session',
    userId,
    sessionId,
    details: {
      hadSession: Boolean(sessionId)
    }
  })
}

export const getAuthSession = async (event: H3Event): Promise<AuthSessionRecord | null> => {
  if (event.context.authSessionLoaded) {
    return event.context.authSession || null
  }

  const sessionId = getAuthSessionId(event)
  if (!sessionId) {
    clearLegacyAuthTokenCookie(event)
    return cacheAuthSession(event, null)
  }

  const redis = useRedis()
  const raw = await redis.get(getSessionKey(sessionId))

  if (!raw) {
    clearAuthSessionCookie(event)
    clearLegacyAuthTokenCookie(event)
    return cacheAuthSession(event, null)
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSessionRecord>
    if (!parsed.userId || !ObjectId.isValid(parsed.userId)) {
      await redis.del(getSessionKey(sessionId))
      clearAuthSessionCookie(event)
      return cacheAuthSession(event, null)
    }

    const now = Date.now()
    const absoluteExpiresAt = typeof parsed.absoluteExpiresAt === 'number'
      ? parsed.absoluteExpiresAt
      : (typeof parsed.createdAt === 'number'
          ? parsed.createdAt + AUTH_SESSION_ABSOLUTE_MAX_AGE * 1000
          : now + AUTH_SESSION_ABSOLUTE_MAX_AGE * 1000)
    const session: AuthSessionRecord = {
      id: sessionId,
      userId: parsed.userId,
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : now,
      lastAccessAt: now,
      absoluteExpiresAt
    }
    const ttlSeconds = getSessionTtlSeconds(session, now)

    if (!ttlSeconds) {
      await redis.del(getSessionKey(sessionId))
      clearAuthSessionCookie(event)
      clearLegacyAuthTokenCookie(event)
      return cacheAuthSession(event, null)
    }

    await redis.set(getSessionKey(sessionId), JSON.stringify(session), 'EX', ttlSeconds)
    setCookie(event, AUTH_SESSION_COOKIE_NAME, session.id, getCookieOptions(ttlSeconds))
    return cacheAuthSession(event, session)
  } catch {
    await redis.del(getSessionKey(sessionId))
    clearAuthSessionCookie(event)
    return cacheAuthSession(event, null)
  }
}

export const getAuthSessionUserId = async (event: H3Event) => {
  const session = await getAuthSession(event)
  return session?.userId || null
}

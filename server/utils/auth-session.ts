import type { H3Event } from 'h3'
import { randomUUID } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { useRedis } from '~/server/utils/redis'
import { writeServerLog } from './server-log'

export const AUTH_SESSION_COOKIE_NAME = 'ns_auth_session'

const AUTH_SESSION_KEY_PREFIX = 'auth:session:'
const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7

type AuthSessionRecord = {
  id: string
  userId: string
  createdAt: number
  lastAccessAt: number
}

const getSessionKey = (sessionId: string) => `${AUTH_SESSION_KEY_PREFIX}${sessionId}`

const getCookieOptions = () => ({
  path: '/',
  maxAge: AUTH_SESSION_MAX_AGE,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
})

const clearLegacyAuthTokenCookie = (event: H3Event) => {
  deleteCookie(event, 'auth-token', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
}

const clearAuthSessionCookie = (event: H3Event) => {
  deleteCookie(event, AUTH_SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
}

const cacheAuthSession = (event: H3Event, session: AuthSessionRecord | null) => {
  event.context.authSession = session
  event.context.authSessionLoaded = true
  return session
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
    lastAccessAt: now
  }

  await redis.set(getSessionKey(session.id), JSON.stringify(session), 'EX', AUTH_SESSION_MAX_AGE)
  setCookie(event, AUTH_SESSION_COOKIE_NAME, session.id, getCookieOptions())
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
    const session: AuthSessionRecord = {
      id: sessionId,
      userId: parsed.userId,
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : now,
      lastAccessAt: now
    }

    await redis.set(getSessionKey(sessionId), JSON.stringify(session), 'EX', AUTH_SESSION_MAX_AGE)
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

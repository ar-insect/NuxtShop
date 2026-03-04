import type { H3Event } from 'h3'
import { randomUUID } from 'crypto'

/**
 * Retrieves the session ID from the request cookies.
 * If no session ID exists, generates a new one and sets it as a cookie.
 * 
 * @param {H3Event} event - The H3 event object.
 * @returns {string} The session ID.
 */
export const getSessionId = (event: H3Event): string => {
  let sessionId = getCookie(event, 'session_id')
  
  if (!sessionId) {
    sessionId = randomUUID()
    setCookie(event, 'session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  return sessionId
}

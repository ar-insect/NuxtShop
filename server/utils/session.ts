import type { H3Event } from 'h3'
import { randomUUID } from 'crypto'

/**
 * 从请求 Cookie 中获取会话 ID。
 * 若不存在会话 ID，则生成一个新的并写入 Cookie。
 * 
 * @param {H3Event} event - H3 事件对象
 * @returns {string} 会话 ID
 */
export const getSessionId = (event: H3Event): string => {
  const authToken = getCookie(event, 'auth-token')
  if (authToken) {
    if (authToken.startsWith('user-jwt-token-')) {
      const username = authToken.replace('user-jwt-token-', '')
      return `user:${username}`
    }
    if (authToken.startsWith('mock-jwt-token-')) {
      return 'user:admin'
    }
  }
  let sessionId = getCookie(event, 'session_id')
  
  if (!sessionId) {
    sessionId = randomUUID()
    setCookie(event, 'session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 天
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  return sessionId
}

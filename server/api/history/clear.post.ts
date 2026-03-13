import { ObjectId } from 'mongodb'
import { getSessionId } from '../../utils/session'
import { clearHistory } from '~/server/utils/history'

export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)

  let userObjectId: ObjectId | undefined
  const token = getCookie(event, 'auth-token')

  if (token && token.startsWith('user-jwt-token-')) {
    const userId = token.replace('user-jwt-token-', '')
    if (ObjectId.isValid(userId)) {
      userObjectId = new ObjectId(userId)
    }
  }

  const key = userObjectId ? { userId: userObjectId } : { sessionId }

  try {
    await clearHistory(key)
    return { success: true }
  } catch (e) {
    console.error('Failed to clear history in MongoDB:', e)
    return { success: false, message: 'Failed to clear history' }
  }
})

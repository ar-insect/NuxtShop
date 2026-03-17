import { ObjectId } from 'mongodb'
import { getSessionId } from '../../utils/session'
import { findHistory } from '~/server/utils/history'

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
    const docs = await findHistory(key, 20)
    return docs.map(d => d.product)
  } catch (e) {
    console.error('Failed to fetch history from MongoDB:', e)
    return []
  }
})

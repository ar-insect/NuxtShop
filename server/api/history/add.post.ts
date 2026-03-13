import { ObjectId } from 'mongodb'
import { getSessionId } from '../../utils/session'
import { upsertHistoryEntry } from '~/server/utils/history'

export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)
  const body = await readBody(event)

  if (!body || !body.id) {
    return { success: false, message: 'Invalid product data' }
  }

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
    await upsertHistoryEntry(key, body, 20)
    return { success: true }
  } catch (e) {
    console.error('Failed to upsert history entry:', e)
    return { success: false, message: 'Failed to save history' }
  }
})

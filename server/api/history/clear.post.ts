import { ObjectId } from 'mongodb'
import { getSessionId } from '../../utils/session'
import { clearHistory } from '~/server/utils/history'
import { getOptionalUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)

  let userObjectId: ObjectId | undefined
  const userId = await getOptionalUserId(event)

  if (userId) {
    userObjectId = new ObjectId(userId)
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

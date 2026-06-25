import { ObjectId } from 'mongodb'
import { getSessionId } from '../../utils/session'
import { findHistory } from '~/server/utils/history'
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
    const docs = await findHistory(key, 20)
    return docs.map(d => d.product)
  } catch (e) {
    console.error('Failed to fetch history from MongoDB:', e)
    return []
  }
})

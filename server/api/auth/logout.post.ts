import { destroyAuthSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await destroyAuthSession(event)

  return {
    success: true
  }
})

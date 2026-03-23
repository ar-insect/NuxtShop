import { requireSuperAdmin } from '~/server/utils/auth'
import { getSystemSettings } from '~/server/utils/system-setting'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const settings = await getSystemSettings()

  return {
    code: 200,
    message: 'OK',
    data: {
      shipping: settings.shipping,
      payments: settings.payments,
      updatedAt: settings.updatedAt.toISOString()
    }
  }
})

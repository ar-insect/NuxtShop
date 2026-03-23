import { getSystemSettings } from '~/server/utils/system-setting'

export default defineEventHandler(async () => {
  const settings = await getSystemSettings()

  return {
    success: true,
    data: {
      shipping: settings.shipping,
      payments: settings.payments
    }
  }
})


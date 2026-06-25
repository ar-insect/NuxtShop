import type { H3Event } from 'h3'
import { requireUserId } from '~/server/utils/auth'
import { findRecentLoginHistory } from '~/server/utils/login-history'
import type { ApiResponse } from '~/types/common'

const simplifyDevice = (ua: string | undefined): string => {
  if (!ua) return 'Unknown'
  const lower = ua.toLowerCase()

  let platform = 'Unknown'
  if (lower.includes('iphone')) platform = 'iPhone'
  else if (lower.includes('ipad')) platform = 'iPad'
  else if (lower.includes('android')) platform = 'Android'
  else if (lower.includes('macintosh')) platform = 'Mac'
  else if (lower.includes('windows')) platform = 'Windows'

  let browser = ''
  if (lower.includes('edg/')) browser = 'Edge'
  else if (lower.includes('chrome/')) browser = 'Chrome'
  else if (lower.includes('safari/') && !lower.includes('chrome/')) browser = 'Safari'
  else if (lower.includes('firefox/')) browser = 'Firefox'

  if (browser) {
    return `${platform} · ${browser}`
  }
  return platform
}

export default async (event: H3Event): Promise<ApiResponse<{ id: string; device: string; ip: string; status: string; time: string }[]>> => {
  const userId = await requireUserId(event)

  const items = await findRecentLoginHistory(userId, 10)

  const data = items.map((item) => ({
    id: String(item._id),
    device: simplifyDevice(item.device),
    ip: item.ip,
    status: item.status,
    time: item.createdAt.toISOString()
  }))

  return {
    code: 200,
    message: 'OK',
    data
  }
}

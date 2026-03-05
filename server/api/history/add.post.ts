import { getSessionId } from '../../utils/session'
import { useRedis } from '../../utils/redis'

export default defineEventHandler(async (event) => {
  const sessionId = getSessionId(event)
  const body = await readBody(event)
  const redis = useRedis()

  if (!redis) {
    return { success: false, message: 'Redis not available' }
  }

  if (!body || !body.id) {
    return { success: false, message: 'Invalid product data' }
  }

  const historyKey = `history:${sessionId}`
  
  // 获取当前历史记录
  const currentData = await redis.get(historyKey)
  let history = currentData ? JSON.parse(currentData) : []

  // 移除相同 ID 的旧记录（用于置顶）
  history = history.filter((item: any) => item.id !== body.id)

  // 新记录插入到列表头部
  history.unshift(body)

  // 最多保留 20 条
  if (history.length > 20) {
    history = history.slice(0, 20)
  }

  // 写回 Redis
  await redis.set(historyKey, JSON.stringify(history))

  return { success: true, history }
})

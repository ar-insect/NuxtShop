import Redis from 'ioredis'
import { useRuntimeConfig } from '#imports'

let redis: Redis | null = null

const createRedisClient = () => {
  const config = useRuntimeConfig()
  const redisOptions = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db,
  }
  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis(redisOptions)

  client.on('error', (err) => {
    console.error('Redis Client Error', err)
  })

  client.on('connect', () => {
    console.log('Redis Client Connected')
  })

  return client
}

/**
 * 获取当前可用的 Redis 客户端实例。
 * 用于在服务端路由中执行 Redis 操作。
 * 
 * @returns {Redis} Redis 客户端实例
 */
export const useRedis = () => {
  if (!redis) {
    redis = createRedisClient()
  }

  return redis
}

export default useRedis

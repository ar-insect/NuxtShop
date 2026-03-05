import Redis from 'ioredis'

const config = useRuntimeConfig()

// 初始化 Redis 客户端
const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
}

/**
 * 全局共享的 Redis 客户端实例。
 * 可通过运行时配置或 REDIS_URL 环境变量进行配置。
 */
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis(redisOptions)

redis.on('error', (err) => {
  console.error('Redis Client Error', err)
})

redis.on('connect', () => {
  console.log('Redis Client Connected')
})

/**
 * 获取当前可用的 Redis 客户端实例。
 * 用于在服务端路由中执行 Redis 操作。
 * 
 * @returns {Redis} Redis 客户端实例
 */
export const useRedis = () => redis
export default redis

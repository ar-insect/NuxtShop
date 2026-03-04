import Redis from 'ioredis'

const config = useRuntimeConfig()

// Initialize Redis client
const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
}

/**
 * The shared Redis client instance.
 * configured via runtime config or REDIS_URL environment variable.
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
 * Retrieves the active Redis client instance.
 * Use this to perform Redis operations in server routes.
 * 
 * @returns {Redis} The Redis client.
 */
export const useRedis = () => redis
export default redis

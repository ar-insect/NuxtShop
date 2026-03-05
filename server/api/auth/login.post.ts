import { useRedis } from '~/server/utils/redis'

/**
 * 处理用户登录。
 * 校验用户名与密码，返回 token 与用户信息。
 * 同时尝试从 Redis 读取并合并最新的用户资料信息。
 * 
 * @param {H3Event} event - H3 事件对象
 * @returns {Promise<{ token: string, user: Object }>} 包含 token 与用户信息的认证结果
 * @throws {H3Error} 当凭据不正确时抛出 401
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  // 优先尝试使用 Redis 中已注册的用户数据进行认证
  if (username && password) {
    const redis = useRedis()
    try {
      const authData = await redis.get(`user:auth:${username}`)
      if (authData) {
        const record = JSON.parse(authData)
        if (record?.password === password) {
          const baseUser = {
            id: record.id,
            username: record.username,
            name: record.username,
            role: record.role || 'user',
            avatar: record.avatar
          }

          // 尝试从 Redis 获取并合并最新资料
          try {
            const key = `user:profile:${baseUser.id}`
            const profileData = await redis.get(key)
            if (profileData) {
              const profile = JSON.parse(profileData)
              if (profile.name) baseUser.name = profile.name
              if (profile.avatar) baseUser.avatar = profile.avatar
            }
          } catch (e) {
            console.error('Error fetching user profile from Redis:', e)
          }

          // 生成与用户名绑定的简易 token
          const token = 'user-jwt-token-' + baseUser.username
          return {
            token,
            user: baseUser
          }
        }
      }
    } catch (e) {
      // 出错时降级走静态管理员逻辑
      console.error('Login with Redis failed:', e)
    }
  }

  if (username === 'admin' && password === '123456') {
    // 生成管理员的 mock token
    const token = 'mock-jwt-token-' + Date.now()
    
    const baseUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    }

    // 尝试从 Redis 获取并合并最新资料
    const redis = useRedis()
    if (redis) {
      try {
        const key = `user:profile:${baseUser.id}`
        const profileData = await redis.get(key)
        if (profileData) {
          const profile = JSON.parse(profileData)
          if (profile.name) baseUser.name = profile.name
          if (profile.avatar) baseUser.avatar = profile.avatar
        }
      } catch (e) {
        console.error('Error fetching user profile from Redis:', e)
      }
    }

    return {
      token,
      user: baseUser
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials. Try admin/123456'
  })
})

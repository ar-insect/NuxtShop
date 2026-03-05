import { useRedis } from '~/server/utils/redis'

/**
 * Handles user login.
 * Validates credentials and returns a mock JWT token and user details.
 * Also attempts to fetch updated user profile data from Redis.
 * 
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ token: string, user: Object }>} The authentication result containing token and user info.
 * @throws {H3Error} 401 Unauthorized if credentials are invalid.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  // First, try to authenticate against registered users in Redis
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

          // Try to get updated profile from Redis
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

          // Issue a simple token bound to username
          const token = 'user-jwt-token-' + baseUser.username
          return {
            token,
            user: baseUser
          }
        }
      }
    } catch (e) {
      // fall through to static admin logic on error
      console.error('Login with Redis failed:', e)
    }
  }

  if (username === 'admin' && password === '123456') {
    // Mock token generation
    const token = 'mock-jwt-token-' + Date.now()
    
    const baseUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    }

    // Try to get updated profile from Redis
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

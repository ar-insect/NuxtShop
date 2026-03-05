import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Registered user token: user-jwt-token-<username>
  if (token.startsWith('user-jwt-token-')) {
    const username = token.replace('user-jwt-token-', '')
    const redis = useRedis()
    try {
      const authData = await redis.get(`user:auth:${username}`)
      if (authData) {
        const record = JSON.parse(authData)
        const baseUser = {
          id: record.id,
          username: record.username,
          name: record.username,
          role: record.role || 'user',
          avatar: record.avatar
        }

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

        return { user: baseUser }
      }
    } catch (e) {
      console.error('Error reading auth data from Redis:', e)
    }
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  // In a real app, verify token and fetch user from DB
  if (token.startsWith('mock-jwt-token-')) {
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
      user: baseUser
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid token'
  })
})

import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, confirmPassword } = body

  if (!username || !password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passwords do not match'
    })
  }

  // Basic password strength check
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters long'
    })
  }

  const redis = useRedis()
  
  // Check if user already exists
  const existingUser = await redis.get(`user:auth:${username}`)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username already exists'
    })
  }

  // In a real app, password should be hashed (e.g., bcrypt)
  // For this demo, we store plain text or simple hash
  // Let's store a simple JSON object
  const newUser = {
    id: Date.now(),
    username,
    password, // TODO: Hash this in production
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
    createdAt: new Date().toISOString()
  }

  // Store user auth info
  await redis.set(`user:auth:${username}`, JSON.stringify(newUser))
  
  // Store initial profile
  await redis.set(`user:profile:${newUser.id}`, JSON.stringify({
    name: username,
    avatar: newUser.avatar
  }))

  return {
    success: true,
    message: 'Registration successful'
  }
})
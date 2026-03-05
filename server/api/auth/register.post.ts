import { useRedis } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, confirmPassword } = body

  if (!username || !password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入用户名和密码'
    })
  }

  if (username === 'admin') {
    throw createError({
      statusCode: 409,
      statusMessage: '用户名已存在'
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '两次输入的密码不一致'
    })
  }

  // 基础密码强度校验
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: '密码长度至少需要6位'
    })
  }

  const redis = useRedis()
  
  // 检查用户是否已存在
  const existingUser = await redis.get(`user:auth:${username}`)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: '用户名已存在'
    })
  }

  // 真实项目中密码应进行哈希（如 bcrypt）
  // 本示例为了演示方便，存储明文或简单哈希
  // 这里存储一个简单的 JSON 对象
  const newUser = {
    id: Date.now(),
    username,
    password, // TODO：生产环境请对密码进行哈希
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
    createdAt: new Date().toISOString()
  }

  // 存储用户认证信息
  await redis.set(`user:auth:${username}`, JSON.stringify(newUser))
  
  // 存储初始用户资料
  await redis.set(`user:profile:${newUser.id}`, JSON.stringify({
    name: username,
    avatar: newUser.avatar
  }))

  return {
    success: true,
    message: '注册成功'
  }
})

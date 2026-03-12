// server/api/auth/login.post.ts
import { findUserByUsername, verifyPassword } from '~/server/utils/user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入用户名和密码',
    });
  }

  // 查找用户
  const user = await findUserByUsername(username);

  if (!user || !user.password) {
    throw createError({
      statusCode: 401,
      statusMessage: '凭据无效，请重试',
    });
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: '凭据无效，请重试',
    });
  }

  // 生成一个简单的 token (真实项目中应使用 JWT 等)
  const token = `user-jwt-token-${user._id}`;

  // 返回部分用户数据，不包含密码
  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  };
});

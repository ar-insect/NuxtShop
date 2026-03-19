// server/api/auth/login.post.ts
import { findUserByUsername, verifyPassword } from '~/server/utils/user';
import { createApiError } from '~/server/utils/api-error';
import type { LoginResponse, UserPublic } from '~/types/api';

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createApiError({
      statusCode: 400,
      code: 'AUTH_MISSING_CREDENTIALS',
      message: '请输入用户名和密码',
      details: null
    });
  }

  // 查找用户
  const user = await findUserByUsername(username);

  if (!user || !user.password) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      message: '凭据无效，请重试',
      details: null
    });
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      message: '凭据无效，请重试',
      details: null
    });
  }

  // 生成一个简单的 token (真实项目中应使用 JWT 等)
  const token = `user-jwt-token-${user._id}`;

  const userPayload: UserPublic = {
    _id: String(user._id),
    username: user.username,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone,
    language: user.language,
    timezone: user.timezone
  }

  return {
    token,
    user: userPayload
  };
});

// server/api/auth/me.get.ts
import { findUserById } from '~/server/utils/user';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // 从 token 中提取用户 ID
  let userId: string | null = null;
  if (token.startsWith('user-jwt-token-')) {
    userId = token.replace('user-jwt-token-', '');
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    });
  }

  if (!userId || !ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    });
  }

  // 从 MongoDB 查找用户
  const user = await findUserById(userId);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    });
  }

  // 返回部分用户数据，不包含密码
  return {
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      timezone: user.timezone,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  };
});

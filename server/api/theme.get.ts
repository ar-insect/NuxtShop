// server/api/theme.get.ts
import { findUserById } from '~/server/utils/user';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  let token = getCookie(event, 'auth-token');

  // 兼容通过 Authorization 头传递的 token（例如：Bearer xxx）
  if (!token) {
    const authHeader = getHeader(event, 'authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  // 未登录时直接返回空配置，让前端使用默认主题，而不是抛 401
  if (!token) {
    return {};
  }

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

  try {
    const user = await findUserById(userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    // 返回用户的偏好设置，如果没有则返回空对象
    return user.preferences || {};
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户偏好设置失败',
    });
  }
});

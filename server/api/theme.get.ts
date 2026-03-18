// server/api/theme.get.ts
import { findUserById } from '~/server/utils/user';
import { createApiError } from '~/server/utils/api-error';
import { getAuthToken, parseUserIdFromToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const token = getAuthToken(event);

  // 未登录时直接返回空配置，让前端使用默认主题，而不是抛 401
  if (!token) {
    return {};
  }

  const userId = parseUserIdFromToken(token);

  if (!userId) {
    throw createApiError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid token',
      details: null
    });
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      throw createApiError({
        statusCode: 404,
        code: 'AUTH_USER_NOT_FOUND',
        message: 'User not found',
        details: null
      });
    }

    // 返回用户的偏好设置，如果没有则返回空对象
    return user.preferences || {};
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw createApiError({
      statusCode: 500,
      code: 'THEME_FETCH_FAILED',
      message: '获取用户偏好设置失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// server/api/theme.post.ts
import { updateUser } from '~/server/utils/user';
import { ObjectId } from 'mongodb';
import type { ThemeConfig } from '~/stores/theme';

export default defineEventHandler(async (event) => {
  let token = getCookie(event, 'auth-token');

  // 兼容通过 Authorization 头传递的 token（例如：Bearer xxx）
  if (!token) {
    const authHeader = getHeader(event, 'authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
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

  const body = await readBody(event);
  const { config } = body; // 期望 body 中包含一个 config 对象，即 ThemeConfig

  if (!config) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少偏好设置配置',
    });
  }

  try {
    const updatedUser = await updateUser(userId, { preferences: config as ThemeConfig });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    return {
      code: 200,
      message: '偏好设置更新成功',
      data: updatedUser.preferences,
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户偏好设置失败',
    });
  }
});

// server/api/theme.post.ts
import { updateUser } from '~/server/utils/user';
import type { ThemeConfig } from '~/stores/theme';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);

  const body = await readBody(event);
  const { config } = body; // 期望 body 中包含一个 config 对象，即 ThemeConfig

  if (!config) {
    throw createApiError({
      statusCode: 400,
      code: 'THEME_MISSING_CONFIG',
      message: '缺少偏好设置配置',
      details: null
    });
  }

  try {
    const updatedUser = await updateUser(userId, { preferences: config as ThemeConfig });

    if (!updatedUser) {
      throw createApiError({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: null
      });
    }

    return {
      code: 200,
      message: '偏好设置更新成功',
      data: updatedUser.preferences,
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw createApiError({
      statusCode: 500,
      code: 'THEME_UPDATE_FAILED',
      message: '更新用户偏好设置失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// server/api/user/update.post.ts
import { updateUser } from '~/server/utils/user';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';
import type { ApiResponse } from '~/types/common';

export default defineEventHandler(async (event): Promise<ApiResponse<{
  _id: string
  username: string
  name?: string
  avatar?: string
  phone?: string
  language?: string
  timezone?: string
}>> => {
  const body = await readBody(event);
  const { name, avatar, phone, language, timezone } = body;

  const userId = requireUserId(event);

  try {
    const updates: Record<string, any> = {};

    if (typeof name !== 'undefined') {
      updates.name = name;
    }
    if (typeof avatar !== 'undefined') {
      updates.avatar = avatar;
    }
    if (typeof phone !== 'undefined') {
      updates.phone = phone;
    }
    if (typeof language !== 'undefined') {
      updates.language = language;
    }
    if (typeof timezone !== 'undefined') {
      updates.timezone = timezone;
    }

    if (Object.keys(updates).length === 0) {
      throw createApiError({
        statusCode: 400,
        code: 'USER_UPDATE_EMPTY',
        message: '没有可更新的字段',
        details: null
      });
    }

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      throw createApiError({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: null
      });
    }

    const response: ApiResponse<{
      _id: string
      username: string
      name?: string
      avatar?: string
      phone?: string
      language?: string
      timezone?: string
    }> = {
      code: 200,
      message: '个人资料更新成功',
      data: {
        _id: String(updatedUser._id),
        username: updatedUser.username,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
      },
    };
    return response;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw createApiError({
      statusCode: 500,
      code: 'USER_UPDATE_FAILED',
      message: '更新个人资料失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

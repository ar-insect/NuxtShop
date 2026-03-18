// server/api/user/update.post.ts
import { updateUser } from '~/server/utils/user';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, avatar, phone, language, timezone } = body;

  const token = getCookie(event, 'auth-token');
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
      throw createError({
        statusCode: 400,
        statusMessage: '没有可更新的字段',
      });
    }

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    return {
      code: 200,
      message: '个人资料更新成功',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
      },
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '更新个人资料失败',
    });
  }
});

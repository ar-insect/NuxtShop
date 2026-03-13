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
    const updatedUser = await updateUser(userId, { name, avatar, phone, language, timezone });

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

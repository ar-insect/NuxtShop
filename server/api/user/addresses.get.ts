// server/api/user/addresses.get.ts
import { findAddressesByUserId } from '~/server/utils/address';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
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
    const addresses = await findAddressesByUserId(userId);
    return {
      code: 200,
      message: '获取收货地址成功',
      data: addresses,
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '获取收货地址失败',
    });
  }
});

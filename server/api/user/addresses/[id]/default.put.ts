// server/api/user/addresses/[id]/default.put.ts
import { setDefaultAddress } from '~/server/utils/address';
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

  const addressId = event.context.params?.id;
  if (!addressId || !ObjectId.isValid(addressId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid address ID',
    });
  }

  try {
    const success = await setDefaultAddress(userId, addressId);

    if (!success) {
      throw createError({
        statusCode: 404,
        statusMessage: '地址未找到或不属于当前用户',
      });
    }

    return {
      code: 200,
      message: '默认地址设置成功',
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '设置默认地址失败',
    });
  }
});

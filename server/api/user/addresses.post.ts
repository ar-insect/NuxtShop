// server/api/user/addresses.post.ts
import { addAddress, setDefaultAddress } from '~/server/utils/address';
import type { Address } from '~/types/address';
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

  const body = await readBody(event);
  const { name, phone, region, detail, isDefault } = body;

  if (!name || !phone || !region || !detail) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必要参数',
    });
  }

  try {
    const newAddress: Omit<Address, '_id' | 'createdAt' | 'updatedAt'> = {
      userId: new ObjectId(userId),
      name,
      phone,
      region,
      detail,
      isDefault: isDefault || false,
    };

    const createdAddress = await addAddress(newAddress);

    // 如果设置为默认地址，则更新其他地址的默认状态
    if (createdAddress.isDefault) {
      await setDefaultAddress(userId, createdAddress._id!.toHexString());
    }

    return {
      code: 200,
      message: '地址添加成功',
      data: createdAddress,
    };
  } catch (error) {
    console.error('Error adding address:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '添加地址失败',
    });
  }
});

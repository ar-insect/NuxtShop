// server/api/user/addresses/[id].put.ts
import { updateAddress, setDefaultAddress } from '~/server/utils/address';
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

  const addressId = event.context.params?.id;
  if (!addressId || !ObjectId.isValid(addressId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid address ID',
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
    const updates: Partial<Address> = {
      name,
      phone,
      region,
      detail,
      isDefault: isDefault || false,
    };

    const updatedAddress = await updateAddress(addressId, updates);

    if (!updatedAddress) {
      throw createError({
        statusCode: 404,
        statusMessage: '地址未找到',
      });
    }

    // 如果设置为默认地址，则更新其他地址的默认状态
    if (updatedAddress.isDefault) {
      await setDefaultAddress(userId, updatedAddress._id!.toHexString());
    }

    return {
      code: 200,
      message: '地址更新成功',
      data: updatedAddress,
    };
  } catch (error) {
    console.error('Error updating address:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '更新地址失败',
    });
  }
});

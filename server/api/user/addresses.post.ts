// server/api/user/addresses.post.ts
import { addAddress, setDefaultAddress } from '~/server/utils/address';
import type { Address } from '~/types/address';
import { ObjectId } from 'mongodb';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);

  const body = await readBody(event);
  const { name, phone, region, detail, isDefault } = body;

  if (!name || !phone || !region || !detail) {
    throw createApiError({
      statusCode: 400,
      code: 'ADDRESS_MISSING_FIELDS',
      message: '缺少必要参数',
      details: null
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
    throw createApiError({
      statusCode: 500,
      code: 'ADDRESS_CREATE_FAILED',
      message: '添加地址失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// server/api/user/addresses/[id].put.ts
import { updateAddress, setDefaultAddress } from '~/server/utils/address';
import type { Address } from '~/types/address';
import { ObjectId } from 'mongodb';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';
import type { ApiResponse } from '~/types/common';

export default defineEventHandler(async (event): Promise<ApiResponse<Address>> => {
  const userId = await requireUserId(event);

  const addressId = event.context.params?.id;
  if (!addressId || !ObjectId.isValid(addressId)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADDRESS_INVALID_ID',
      message: 'Invalid address ID',
      details: null
    });
  }

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
    const updates: Partial<Address> = {
      name,
      phone,
      region,
      detail,
      isDefault: isDefault || false,
    };

    const updatedAddress = await updateAddress(addressId, updates);

    if (!updatedAddress) {
      throw createApiError({
        statusCode: 404,
        code: 'ADDRESS_NOT_FOUND',
        message: '地址未找到',
        details: null
      });
    }

    // 如果设置为默认地址，则更新其他地址的默认状态
    if (updatedAddress.isDefault) {
      await setDefaultAddress(userId, updatedAddress._id!.toHexString());
    }

    const response: ApiResponse<Address> = {
      code: 200,
      message: '地址更新成功',
      data: updatedAddress,
    };
    return response;
  } catch (error) {
    console.error('Error updating address:', error);
    throw createApiError({
      statusCode: 500,
      code: 'ADDRESS_UPDATE_FAILED',
      message: '更新地址失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

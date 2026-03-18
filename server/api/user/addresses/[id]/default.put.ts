// server/api/user/addresses/[id]/default.put.ts
import { setDefaultAddress } from '~/server/utils/address';
import { ObjectId } from 'mongodb';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);

  const addressId = event.context.params?.id;
  if (!addressId || !ObjectId.isValid(addressId)) {
    throw createApiError({
      statusCode: 400,
      code: 'ADDRESS_INVALID_ID',
      message: 'Invalid address ID',
      details: null
    });
  }

  try {
    const success = await setDefaultAddress(userId, addressId);

    if (!success) {
      throw createApiError({
        statusCode: 404,
        code: 'ADDRESS_NOT_FOUND',
        message: '地址未找到或不属于当前用户',
        details: null
      });
    }

    return {
      code: 200,
      message: '默认地址设置成功',
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    throw createApiError({
      statusCode: 500,
      code: 'ADDRESS_SET_DEFAULT_FAILED',
      message: '设置默认地址失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

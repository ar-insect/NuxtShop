// server/api/user/addresses/[id].delete.ts
import { deleteAddress } from '~/server/utils/address';
import { ObjectId } from 'mongodb';
import { createApiError } from '~/server/utils/api-error';

export default defineEventHandler(async (event) => {

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
    const success = await deleteAddress(addressId);

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
      message: '地址删除成功',
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    throw createApiError({
      statusCode: 500,
      code: 'ADDRESS_DELETE_FAILED',
      message: '删除地址失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

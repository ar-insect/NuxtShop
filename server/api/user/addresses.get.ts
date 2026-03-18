// server/api/user/addresses.get.ts
import { findAddressesByUserId } from '~/server/utils/address';
import { createApiError } from '~/server/utils/api-error';
import { requireUserId } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);

  try {
    const addresses = await findAddressesByUserId(userId);
    return {
      code: 200,
      message: '获取收货地址成功',
      data: addresses,
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw createApiError({
      statusCode: 500,
      code: 'ADDRESS_FETCH_FAILED',
      message: '获取收货地址失败',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

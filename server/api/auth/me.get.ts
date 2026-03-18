// server/api/auth/me.get.ts
import { createApiError } from '~/server/utils/api-error';
import type { MeResponse, UserPublic } from '~/types/api';
import { requireUser } from '~/server/utils/auth';

export default defineEventHandler(async (event): Promise<MeResponse> => {
  const user = await requireUser(event);

  const userPayload: UserPublic = {
    _id: String(user._id),
    username: user.username,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    language: user.language,
    timezone: user.timezone,
    phone: user.phone
  }

  return {
    user: userPayload,
  };
});

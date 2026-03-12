// server/api/reviews/add.post.ts
import { v4 as uuidv4 } from 'uuid';
import { useRedis } from '~/server/utils/redis'; // 仍然需要 Redis 来存储评论
import { findUserById } from '~/server/utils/user'; // 导入 findUserById
import { ObjectId } from 'mongodb'; // 导入 ObjectId

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录',
    });
  }

  // 从 token 中提取用户 ID
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

  // 从 MongoDB 获取用户信息
  const user = await findUserById(userId);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户无效',
    });
  }

  const body = await readBody(event);
  const { productId, rating, content } = body;

  if (!productId || !rating || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必要参数',
    });
  }

  const review = {
    id: uuidv4(),
    productId,
    userId: user._id, // 使用 MongoDB 的 _id
    username: user.name || user.username, // 使用用户的 name 或 username
    userAvatar: user.avatar,
    rating: Number(rating),
    content,
    createdAt: new Date().toISOString(),
  };

  try {
    const redis = useRedis(); // 仍然需要 Redis 来存储评论
    if (!redis) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Redis service unavailable',
      });
    }
    // 将评价存储到 Redis 列表
    // 使用 lpush 将最新评价插入到列表头部
    await redis.lpush(`reviews:product:${productId}`, JSON.stringify(review));

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Redis error adding review:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '评价提交失败，请稍后重试',
    });
  }
});

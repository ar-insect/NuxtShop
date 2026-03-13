// server/api/reviews/add.post.ts
import { ObjectId } from 'mongodb'
import { findUserById } from '~/server/utils/user'
import { insertReview } from '~/server/utils/review'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }

  let userId: string | null = null
  if (token.startsWith('user-jwt-token-')) {
    userId = token.replace('user-jwt-token-', '')
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  if (!userId || !ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  const user = await findUserById(userId)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户无效'
    })
  }

  const body = await readBody(event)
  const { productId, rating, content } = body

  const numericProductId = Number(productId)

  if (!numericProductId || !rating || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必要参数'
    })
  }

  try {
    const created = await insertReview({
      productId: numericProductId,
      userId: user._id as ObjectId,
      username: user.name || user.username,
      userAvatar: user.avatar,
      rating: Number(rating),
      content,
      createdAt: new Date()
    })

    return {
      success: true,
      data: {
        id: created._id?.toHexString() || '',
        productId: created.productId,
        userId: (created.userId as ObjectId).toHexString(),
        username: created.username,
        userAvatar: created.userAvatar,
        rating: created.rating,
        content: created.content,
        createdAt: created.createdAt.toISOString()
      }
    }
  } catch (error) {
    console.error('Mongo error adding review:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '评价提交失败，请稍后重试'
    })
  }
})

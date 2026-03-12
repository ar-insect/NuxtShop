import { defineEventHandler, readBody } from 'h3'
import { updateOne } from '~/server/utils/mongodb'
import { ObjectId, Double, Int32 } from 'mongodb'

// 客户端请求体的数据结构
interface ProductRequestBody {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  description?: string;
  specs?: { [key: string]: number | string };
}

// 实际存储到 MongoDB 的文档结构
interface ProductDocument {
  _id?: ObjectId;
  name?: string;
  price?: Double;
  stock?: Int32;
  category?: string;
  description?: string;
  specs?: { [key: string]: Int32 | string };
  updateTime?: Date; // 添加更新时间
}

export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.id
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Product ID is required.',
        fatal: false
      })
    }

    const body = await readBody<ProductRequestBody>(event)

    // 构建更新操作
    const updateFields: Partial<ProductDocument> = {}
    if (body.name !== undefined) updateFields.name = body.name
    if (body.price !== undefined) updateFields.price = new Double(body.price)
    if (body.stock !== undefined) updateFields.stock = new Int32(body.stock)
    if (body.category !== undefined) updateFields.category = body.category
    if (body.description !== undefined) updateFields.description = body.description
    if (body.specs !== undefined) {
      updateFields.specs = Object.fromEntries(
        Object.entries(body.specs).map(([key, value]) => [key, typeof value === 'number' ? new Int32(value) : value])
      )
    }
    updateFields.updateTime = new Date() // 自动设置更新时间

    if (Object.keys(updateFields).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'No fields to update.',
        fatal: false
      })
    }

    const result = await updateOne<ProductDocument>(
      'products',
      { _id: new ObjectId(productId) },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Product with ID ${productId} not found.`,
        fatal: false
      })
    }

    return {
      message: `Product with ID ${productId} updated successfully`,
      modifiedCount: result.modifiedCount
    }
  } catch (error: any) {
    console.error('Error updating product:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      message: error.message || 'Failed to update product.',
      fatal: false
    })
  }
})

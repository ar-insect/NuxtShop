import { defineEventHandler, readBody } from 'h3'
import { insertOne } from '~/server/utils/mongodb'
import { type ObjectId, Double, Int32 } from 'mongodb' // ObjectId 标记为类型导入

// 客户端请求体的数据结构
interface ProductRequestBody {
  name: string;
  price: number; // 客户端传入的是普通 number
  stock: number; // 客户端传入的是普通 number
  category: string;
  description?: string;
  specs?: { [key: string]: number | string };
}

// 实际存储到 MongoDB 的文档结构
interface ProductDocument {
  _id?: ObjectId;
  name: string;
  price: Double; // MongoDB 存储 Double 类型
  stock: Int32; // MongoDB 存储 Int32 类型
  category: string;
  description?: string;
  specs?: { [key: string]: Int32 | string };
  createTime: Date;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ProductRequestBody>(event) // 使用 ProductRequestBody

    // 验证必要字段
    if (!body.name || body.price === undefined || body.stock === undefined || !body.category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Missing required product fields (name, price, stock, category).',
        fatal: false
      })
    }

    // 构建实际要插入的文档，进行类型转换
    const productToInsert: ProductDocument = {
      name: body.name,
      price: new Double(body.price), // 转换为 Double
      stock: new Int32(body.stock),   // 转换为 Int32
      category: body.category,
      description: body.description,
      specs: body.specs ? Object.fromEntries(
        Object.entries(body.specs).map(([key, value]) => [key, typeof value === 'number' ? new Int32(value) : value])
      ) : undefined,
      createTime: new Date() // 自动设置创建时间
    }

    const result = await insertOne<ProductDocument>('products', productToInsert) // 插入 ProductDocument

    if (!result.acknowledged || !result.insertedId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to insert product into MongoDB.',
        fatal: false
      })
    }

    return {
      message: 'Product added successfully',
      productId: result.insertedId.toHexString()
    }
  } catch (error: any) {
    console.error('Error adding product:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      message: error.message || 'Failed to add product.',
      fatal: false
    })
  }
})

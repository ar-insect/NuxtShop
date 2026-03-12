import { defineEventHandler } from 'h3'
import { find, insertOne } from '~/server/utils/mongodb' // 导入封装好的方法
import { ObjectId, Double, Int32 } from 'mongodb'

interface Product {
  _id?: ObjectId;
  name: string;
  price: Double;
  stock: Int32;
  category: string;
  description: string;
  specs?: { [key: string]: Int32 | string };
  createTime: Date;
}

export default defineEventHandler(async (event) => {
  try {
    // 使用封装好的 find 方法检查集合是否为空
    const count = await find<Product>('products', {}, { limit: 1 })
    if (count.length === 0) {
      const sampleProduct: Product = {
        _id: new ObjectId('69b229a13576c82ac0a0ef1a'),
        name: 'Vue.js 实战教程',
        price: new Double(89.9),
        stock: new Int32(200),
        category: '书籍/编程',
        description: '适合前端入门的 Vue 实战书籍',
        specs: {
          language: '中文',
          pages: new Int32(350)
        },
        createTime: new Date('2026-03-12T02:49:05.796Z')
      }
      // 使用封装好的 insertOne 方法插入示例数据
      await insertOne<Product>('products', sampleProduct)
      console.log('Inserted sample product into MongoDB using insertOne.')
    }

    // 使用封装好的 find 方法获取所有商品
    const products = await find<Product>('products')
    return products
  } catch (error) {
    console.error('Error fetching or inserting products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch or insert products from MongoDB',
    })
  }
})

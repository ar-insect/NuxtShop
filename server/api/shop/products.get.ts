import { defineEventHandler } from 'h3'
import { getDb } from '~/server/utils/mongodb'
import { ObjectId, Double, Int32 } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const productsCollection = db.collection('products')

    // 检查集合是否为空，如果为空则插入示例数据
    const count = await productsCollection.countDocuments()
    if (count === 0) {
      const sampleProduct = {
        _id: new ObjectId('69b229a13576c82ac0a0ef1a'),
        name: 'Vu111111e.js 实战教程',
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
      await productsCollection.insertOne(sampleProduct)
      console.log('Inserted sample product into MongoDB.')
    }

    const products = await productsCollection.find().toArray()
    return products
  } catch (error) {
    console.error('Error fetching or inserting products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch or insert products from MongoDB',
    })
  }
})

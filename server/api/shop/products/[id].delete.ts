import { defineEventHandler } from 'h3'
import { deleteOne } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

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

    const result = await deleteOne('products', { _id: new ObjectId(productId) })

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Product with ID ${productId} not found.`,
        fatal: false
      })
    }

    return {
      message: `Product with ID ${productId} deleted successfully`,
      deletedCount: result.deletedCount
    }
  } catch (error: any) {
    console.error('Error deleting product:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      message: error.message || 'Failed to delete product.',
      fatal: false
    })
  }
})

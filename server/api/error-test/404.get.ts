import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found - Simulated',
    message: 'This is a simulated 404 error for demonstration purposes.',
    fatal: false // 将 fatal 设置为 false，避免直接终止应用
  })
})

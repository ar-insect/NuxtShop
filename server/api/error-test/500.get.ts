import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error - Simulated',
    message: 'This is a simulated 500 error for demonstration purposes.',
    fatal: false // 将 fatal 设置为 false，避免直接终止应用
  })
})

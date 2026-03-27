import type { ApiResponse } from '~/types/common'

export default defineEventHandler(async (): Promise<ApiResponse<{ markdown: string }>> => {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const rootDir = process.cwd()
  const filePath = path.resolve(rootDir, 'README_EN.md')

  try {
    const markdown = await fs.readFile(filePath, 'utf-8')
    return { code: 200, message: 'OK', data: { markdown } }
  } catch {
    return { code: 200, message: 'OK', data: { markdown: '' } }
  }
})

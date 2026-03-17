export default defineEventHandler(async () => {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const rootDir = process.cwd()
  const filePath = path.resolve(rootDir, 'README_EN.md')

  try {
    const markdown = await fs.readFile(filePath, 'utf-8')
    return { markdown }
  } catch {
    return { markdown: '' }
  }
})


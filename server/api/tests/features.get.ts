import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async () => {
  const featuresDir = path.resolve(process.cwd(), 'tests/e2e/features')

  try {
    const files = await fs.readdir(featuresDir)
    const featureFiles = files
      .filter(file => file.endsWith('.feature'))
      .map(file => file.replace('.feature', ''))
    
    return {
      success: true,
      data: featureFiles
    }
  } catch (error) {
    console.error('Failed to read feature files:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve feature files'
    })
  }
})
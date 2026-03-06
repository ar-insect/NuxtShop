import { execa } from 'execa'
import path from 'node:path'
import { defineEventHandler, readBody, createError } from 'h3'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const feature = body.feature // 可以是文件名 (不带 .feature) 或 'all'

  const projectRoot = process.cwd()
  const playwrightExecutable = path.join(projectRoot, 'node_modules/.bin/playwright')
  
  // 第一步：执行 bddgen 生成测试文件
  try {
    await execa('npx', ['bddgen'], { cwd: projectRoot })
  } catch (bddgenError: any) {
    console.error('Failed to run bddgen:', bddgenError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate BDD test files',
      data: bddgenError.stdout + bddgenError.stderr || bddgenError.message
    })
  }

  const args = ['test']
  const generatedTestDir = path.join(projectRoot, '.features-gen', 'tests', 'e2e', 'features') // bddgen 默认输出目录

  if (feature && feature !== 'all') {
    // 运行单个 feature 文件
    const generatedFeatureFilePath = path.join(generatedTestDir, `${feature}.feature.spec.js`)
    args.push(generatedFeatureFilePath)
  } else {
    // 运行所有 feature 文件
    args.push(generatedTestDir)
  }

  // 确保使用 list 报告器，以便在控制台输出
  args.push('--reporter=list')
  // 确保不打开 HTML 报告
  args.push('--project=chromium') // 明确指定项目，避免不必要的浏览器启动

  try {
    const { stdout, stderr } = await execa(playwrightExecutable, args, {
      cwd: projectRoot,
      env: {
        ...process.env,
        NUXT_PUBLIC_DISABLE_CAPTCHA: '1', // 确保测试时禁用验证码
      }
    })

    const report = stdout + stderr

    return {
      success: true,
      report: report
    }
  } catch (error: any) {
    console.error('Failed to run Playwright tests:', error)
    return {
      success: false,
      report: error.stdout + error.stderr || error.message || '未知错误'
    }
  }
})
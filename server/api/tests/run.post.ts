import { execa } from 'execa'
import path from 'node:path'
import fs from 'node:fs/promises' // 导入 fs 模块
import { defineEventHandler, readBody, createError } from 'h3'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const feature = body.feature // 可以是文件名 (不带 .feature) 或 'all'

  const projectRoot = process.cwd()
  const playwrightExecutable = path.join(projectRoot, 'node_modules/.bin/playwright')
  const jsonReportPath = path.join(projectRoot, 'test-results', 'report.json')

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
  const generatedTestDir = path.join(projectRoot, '.features-gen', 'tests', 'e2e', 'features')

  if (feature && feature !== 'all') {
    const generatedFeatureFilePath = path.join(generatedTestDir, `${feature}.feature.spec.js`)
    args.push(generatedFeatureFilePath)
  } else {
    args.push(generatedTestDir)
  }

  // 确保不打开 HTML 报告
  args.push('--project=chromium') // 明确指定项目，避免不必要的浏览器启动

  let rawReport = ''
  try {
    const { stdout, stderr } = await execa(playwrightExecutable, args, {
      cwd: projectRoot,
      env: {
        ...process.env,
        NUXT_PUBLIC_DISABLE_CAPTCHA: '1', // 确保测试时禁用验证码
      }
    })
    rawReport = stdout + stderr
  } catch (error: any) {
    console.error('Failed to run Playwright tests:', error)
    rawReport = error.stdout + error.stderr || error.message || '未知错误'
    // 不直接抛出错误，而是尝试读取 JSON 报告
  }

  // 读取并解析 JSON 报告
  let structuredReport: any = null
  try {
    const reportContent = await fs.readFile(jsonReportPath, 'utf-8')
    structuredReport = JSON.parse(reportContent)
  } catch (readReportError: any) {
    console.error('Failed to read or parse JSON report:', readReportError)
    return {
      success: false,
      report: `无法生成结构化报告: ${readReportError.message}\n原始输出:\n${rawReport}`
    }
  }

  const processedTests: any[] = []
  let allTestsPassed = true

  async function processSuites(suites: any[]) {
    for (const suite of suites) {
      if (suite.suites) {
        await processSuites(suite.suites) // 递归处理嵌套的 suites
      }
      if (suite.specs) {
        for (const spec of suite.specs) {
          for (const test of spec.tests) {
            const testResult: any = {
                title: spec.title, // 使用 spec 的 title 作为测试标题
                status: test.status,
                errors: test.errors && Array.isArray(test.errors) ? test.errors.map((e: any) => e.message).join('\n') : '',
                screenshots: []
              }

            if (test.status === 'failed' || test.status === 'timedOut' || test.status === 'unexpected') {
              allTestsPassed = false
              // 提取所有错误信息
              const allErrors: string[] = []
              if (test.errors && Array.isArray(test.errors)) {
                allErrors.push(...test.errors.map((e: any) => e.message))
              }
              for (const result of test.results) {
                if (result.errors && Array.isArray(result.errors)) {
                  allErrors.push(...result.errors.map((e: any) => e.message))
                }
                if (result.stderr && Array.isArray(result.stderr)) {
                  allErrors.push(...result.stderr.map((s: any) => s.text))
                }
                // 遍历 test.results 获取附件
                for (const attachment of result.attachments) {
                  if (attachment.name === 'screenshot' && attachment.path) {
                    console.log('Attempting to read screenshot from:', attachment.path)
                    try {
                      const screenshotBuffer = await fs.readFile(attachment.path)
                      testResult.screenshots.push(`data:${attachment.contentType};base64,${screenshotBuffer.toString('base64')}`)
                    } catch (screenshotError: any) {
                      console.error(`Failed to read screenshot ${attachment.path}:`, screenshotError.message)
                    }
                  }
                }
              }
              testResult.errors = allErrors.join('\n')
            }
            processedTests.push(testResult)
          }
        }
      }
    }
  }

  await processSuites(structuredReport.suites)

  return {
    success: allTestsPassed,
    report: {
      summary: structuredReport.stats,
      tests: processedTests
    }
  }
})
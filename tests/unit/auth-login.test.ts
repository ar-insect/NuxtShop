// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// 简单的 createError mock，直接抛出 Error，方便用 rejects.toThrow 断言
vi.stubGlobal('createError', (opts: any) => new Error(opts?.statusMessage || 'error'))

describe('server/api/auth/login.post', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    vi.stubGlobal('createError', (opts: any) => new Error(opts?.statusMessage || 'error'))
  })

  it('admin 正确凭据登录成功，返回 token 和 user', async () => {
    // 先 stub 全局函数，再动态导入 handler，避免 defineEventHandler 未定义
    vi.stubGlobal('defineEventHandler', (fn: any) => fn)
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      username: 'admin',
      password: '123456'
    }))

    vi.mock('~/server/utils/redis', () => ({
      useRedis: () => null
    }))

    const { default: loginHandler } = await import('~/server/api/auth/login.post')
    const event = {} as H3Event
    const res = await (loginHandler as any)(event)

    expect(res).toBeTruthy()
    expect(res.user).toBeTruthy()
    expect(res.user.username).toBe('admin')
    expect(res.token).toMatch(/mock-jwt-token-/)
  })

  it('admin 错误密码时抛出认证错误', async () => {
    vi.stubGlobal('defineEventHandler', (fn: any) => fn)
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      username: 'admin',
      password: 'wrong'
    }))

    vi.mock('~/server/utils/redis', () => ({
      useRedis: () => null
    }))

    const { default: loginHandler } = await import('~/server/api/auth/login.post')
    const event = {} as H3Event

    await expect((loginHandler as any)(event)).rejects.toThrow('凭据无效')
  })
})

// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

describe('server/api/auth/login.post', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    vi.stubGlobal('defineEventHandler', (fn: any) => fn)
  })

  it('admin 正确凭据登录成功，写入 session 并返回 user', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      username: 'admin',
      password: '123456'
    }))

    const createAuthSession = vi.fn().mockResolvedValue(undefined)
    vi.doMock('~/server/utils/user', () => ({
      findUserByUsername: vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'admin',
        password: 'hashed-password',
        role: 'admin',
        name: 'Admin User',
        avatar: '',
        phone: '13800000000',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        twoFactorEnabled: false
      }),
      verifyPassword: vi.fn().mockResolvedValue(true)
    }))
    vi.doMock('#imports', () => ({
      useRuntimeConfig: () => ({
        admin: {
          username: 'admin'
        }
      })
    }))
    vi.doMock('~/server/utils/login-history', () => ({
      insertLoginHistory: vi.fn().mockResolvedValue(undefined)
    }))
    vi.doMock('~/server/utils/two-factor', () => ({
      createTwoFactorCode: vi.fn(),
      maskPhone: vi.fn()
    }))
    vi.doMock('~/server/utils/auth-session', () => ({
      createAuthSession
    }))

    const { default: loginHandler } = await import('~/server/api/auth/login.post')
    const event = {} as H3Event
    const res = await (loginHandler as any)(event)

    expect(res).toBeTruthy()
    expect(res.user).toBeTruthy()
    expect(res.user.username).toBe('admin')
    expect(createAuthSession).toHaveBeenCalledWith(event, '507f1f77bcf86cd799439011')
    expect(res.token).toBeUndefined()
  })

  it('admin 错误密码时抛出认证错误', async () => {
    vi.stubGlobal('readBody', vi.fn().mockResolvedValue({
      username: 'admin',
      password: 'wrong'
    }))

    vi.doMock('~/server/utils/user', () => ({
      findUserByUsername: vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'admin',
        password: 'hashed-password'
      }),
      verifyPassword: vi.fn().mockResolvedValue(false)
    }))
    vi.doMock('~/server/utils/login-history', () => ({
      insertLoginHistory: vi.fn().mockResolvedValue(undefined)
    }))
    vi.doMock('~/server/utils/two-factor', () => ({
      createTwoFactorCode: vi.fn(),
      maskPhone: vi.fn()
    }))
    vi.doMock('~/server/utils/auth-session', () => ({
      createAuthSession: vi.fn()
    }))
    vi.doMock('#imports', () => ({
      useRuntimeConfig: () => ({
        admin: {
          username: 'admin'
        }
      })
    }))

    const { default: loginHandler } = await import('~/server/api/auth/login.post')
    const event = {} as H3Event

    await expect((loginHandler as any)(event)).rejects.toThrow('凭据无效')
  })
})

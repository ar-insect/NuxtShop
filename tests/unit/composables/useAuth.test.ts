// @ts-nocheck
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { ref, computed } from 'vue'

const createUseStateMock = () => {
  const store = new Map<string, any>()
  return (key: string, init?: () => any) => {
    if (!store.has(key)) {
      store.set(key, ref(init ? init() : null))
    }
    return store.get(key)
  }
}

const createUseCookieMock = () => {
  const store = new Map<string, any>()
  return (key: string) => {
    if (!store.has(key)) {
      store.set(key, ref(null))
    }
    return store.get(key)
  }
}

// 在顶层定义 mock 函数，避免 vi.mock 工厂提前执行时找不到变量
const routerPushMock = vi.fn()
const resetCartLocalMock = vi.fn()
const refreshCartMock = vi.fn()
const resetWishlistLocalMock = vi.fn()
const refreshWishlistMock = vi.fn()
const resetOrdersLocalMock = vi.fn()
const refreshOrdersMock = vi.fn()
const toastSuccessMock = vi.fn()
const toastErrorMock = vi.fn()

// 顶层模块 mock：useCart / useWishlist / useOrders
vi.mock('~/modules/cart/composables/useCart', () => ({
  useCart: () => ({
    resetCartLocal: resetCartLocalMock,
    refreshCart: refreshCartMock
  })
}))
vi.mock('~/composables/useWishlist', () => ({
  useWishlist: () => ({
    resetWishlistLocal: resetWishlistLocalMock,
    refreshWishlist: refreshWishlistMock
  })
}))
vi.mock('~/modules/order/composables/useOrders', () => ({
  useOrders: () => ({
    resetOrdersLocal: resetOrdersLocalMock,
    refreshOrders: refreshOrdersMock
  })
}))

describe('useAuth composable', () => {

  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()

    // mock core Nuxt composables
    const useState = createUseStateMock()
    const useCookie = createUseCookieMock()

    routerPushMock.mockReset()
    resetCartLocalMock.mockReset()
    refreshCartMock.mockReset()
    resetWishlistLocalMock.mockReset()
    refreshWishlistMock.mockReset()
    resetOrdersLocalMock.mockReset()
    refreshOrdersMock.mockReset()
    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()

    vi.stubGlobal('useState', useState)
    vi.stubGlobal('useCookie', useCookie)
    // Nuxt 自动导入的 computed 在测试环境中不存在，这里用 Vue 自带的 computed 填充
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useRouter', () => ({ push: routerPushMock }))
    vi.stubGlobal('useToast', () => ({
      success: toastSuccessMock,
      error: toastErrorMock,
      info: vi.fn()
    }))

    // 某些 Nuxt 逻辑或插件内部可能会调用 useFetch，这里提供一个安全的全局 stub
    vi.stubGlobal('useFetch', vi.fn().mockResolvedValue({
      data: ref(null),
      error: ref(null)
    }))

    vi.stubGlobal('nextTick', () => Promise.resolve())
  })

  it('login 成功时会设置 token 和 user，返回 true', async () => {
    const mockUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      avatar: ''
    }

    const fetchMock = vi.fn().mockResolvedValue({
      token: 'mock-token',
      user: mockUser
    })
    vi.stubGlobal('$fetch', fetchMock)

    const { useAuth } = await import('~/composables/useAuth')
    const { login, user, token, isAuthenticated } = useAuth()

    const ok = await login('admin', '123456', { redirect: false })

    expect(ok).toBe(true)
    expect(token.value).toBe('mock-token')
    expect(user.value).toEqual(mockUser)
    expect(isAuthenticated.value).toBe(true)

    expect(resetCartLocalMock).toHaveBeenCalled()
    expect(resetWishlistLocalMock).toHaveBeenCalled()
    expect(resetOrdersLocalMock).toHaveBeenCalled()
    expect(refreshCartMock).toHaveBeenCalled()
    expect(refreshWishlistMock).toHaveBeenCalled()
    expect(refreshOrdersMock).toHaveBeenCalled()
    expect(routerPushMock).not.toHaveBeenCalled()
  })

  it('login 失败时返回 false 并调用 toast.error', async () => {
    const error = new Error('登录失败')
    const fetchMock = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('$fetch', fetchMock)

    const { useAuth } = await import('~/composables/useAuth')
    const { login, user, token } = useAuth()

    const ok = await login('admin', 'wrong', { redirect: false })

    expect(ok).toBe(false)
    expect(toastErrorMock).toHaveBeenCalled()
    expect(user.value).toBeNull()
    expect(token.value).toBeNull()
  })

  it('logout 会清空 token 和 user，并重置本地状态', async () => {
    const { useAuth } = await import('~/composables/useAuth')
    const { user, token, logout, isAuthenticated } = useAuth()

    // 手动设置已登录状态
    user.value = { id: 1, username: 'admin', name: 'Admin', role: 'admin', avatar: '' }
    token.value = 'mock-token'

    logout()

    expect(user.value).toBeNull()
    expect(token.value).toBeNull()
    expect(isAuthenticated.value).toBe(false)

    expect(resetCartLocalMock).toHaveBeenCalled()
    expect(resetWishlistLocalMock).toHaveBeenCalled()
    expect(resetOrdersLocalMock).toHaveBeenCalled()
    expect(routerPushMock).toHaveBeenCalledWith('/login')
  })
})

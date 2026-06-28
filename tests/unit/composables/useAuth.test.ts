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
const localStorageRemoveItemMock = vi.fn()
const handleErrorMock = vi.fn((error?: Error) => {
  toastErrorMock(error?.message || 'error')
})

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
vi.mock('~/composables/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({
    handleError: handleErrorMock
  })
}))
vi.mock('~/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
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
    localStorageRemoveItemMock.mockReset()
    handleErrorMock.mockClear()

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
    vi.stubGlobal('window', {
      localStorage: {
        removeItem: localStorageRemoveItemMock
      }
    })
  })

  it('login 成功时会设置 user 并返回 success', async () => {
    const mockUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      avatar: ''
    }

    const fetchMock = vi.fn().mockResolvedValue({
      user: mockUser
    })
    vi.stubGlobal('$fetch', fetchMock)

    const { useAuth } = await import('~/composables/useAuth')
    const { login, user, isAuthenticated } = useAuth()

    const result = await login('admin', '123456', { redirect: false })

    expect(result).toEqual({ success: true })
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
    const { login, user } = useAuth()

    const result = await login('admin', 'wrong', { redirect: false })

    expect(result).toEqual({ success: false })
    expect(toastErrorMock).toHaveBeenCalled()
    expect(user.value).toBeNull()
  })

  it('logout 会清空 user，并重置本地状态', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: true }))
    const { useAuth } = await import('~/composables/useAuth')
    const { user, logout, isAuthenticated } = useAuth()

    // 手动设置已登录状态
    user.value = { id: 1, username: 'admin', name: 'Admin', role: 'admin', avatar: '' }

    await logout()

    expect(user.value).toBeNull()
    expect(isAuthenticated.value).toBe(false)

    expect(resetCartLocalMock).toHaveBeenCalled()
    expect(resetWishlistLocalMock).toHaveBeenCalled()
    expect(resetOrdersLocalMock).toHaveBeenCalled()
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith('nuxtshop-admin-tabs')
    expect(routerPushMock).toHaveBeenCalledWith('/login')
  })
})

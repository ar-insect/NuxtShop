// composables/useAuth.ts
import { useCart } from '~/modules/cart/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import { useOrders } from '~/modules/order/composables/useOrders'
import type { LoginResponse, LoginSuccessResponse, UserPublic } from '~/types/api'
import { http } from '~/utils/http'
import { useApiErrorHandler } from '~/composables/useApiErrorHandler'
import { useI18n } from '~/composables/useI18n'

export type User = UserPublic

type LoginOptions = {
  redirect?: boolean
  redirectTo?: string
}

/**
 * 认证状态与行为的组合式函数。
 * 提供登录、退出、注册及读取当前用户信息的方法。
 * 
 * @returns {Object} 认证状态与方法
 * @property {Ref<User | null>} user - 当前登录用户状态
 * @property {CookieRef<string | null>} token - 认证 token（Cookie）
 * @property {ComputedRef<boolean>} isAuthenticated - 是否已登录
 * @property {Function} login - 登录方法
 * @property {Function} logout - 退出登录方法
 */
export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const token = useCookie('auth-token', {
    maxAge: 60 * 60 * 24 * 7, // 1 周
    sameSite: 'lax'
  })
  const toast = useToast()
  const router = useRouter()
  const { resetCartLocal, refreshCart } = useCart()
  const { resetWishlistLocal, refreshWishlist } = useWishlist()
  const { resetOrdersLocal, refreshOrders } = useOrders()
  const { handleError } = useApiErrorHandler()
  const { t } = useI18n()

  const applyLoginPayload = async (payload: LoginSuccessResponse, options: LoginOptions) => {
    token.value = payload.token
    user.value = payload.user as User
    resetCartLocal()
    resetWishlistLocal()
    resetOrdersLocal()
    await nextTick()
    await refreshCart()
    await refreshWishlist()
    await refreshOrders()
    if (options.redirect !== false) {
      await router.push(options.redirectTo || '/')
    }
  }

  type LoginResult =
    | { success: true }
    | { success: false; requires2FA?: false }
    | { success: false; requires2FA: true; userId: string; maskedPhone?: string }

  const login = async (username: string, password: string, options: LoginOptions = {}): Promise<LoginResult> => {
    try {
      const res = await http.post<LoginResponse>('/auth/login', {
        username,
        password
      })

      if ('requires2FA' in res && res.requires2FA) {
        if (import.meta.client && res.debugCode) {
          // eslint-disable-next-line no-console
          console.info('[2FA DEBUG] login code:', res.debugCode)
        }
        return {
          success: false,
          requires2FA: true,
          userId: res.userId,
          maskedPhone: res.maskedPhone
        }
      }

      await applyLoginPayload(res as LoginSuccessResponse, options)
      return { success: true }
    } catch (e: any) {
      handleError(e)
      return { success: false }
    }
  }

  const verifyTwoFactorLogin = async (userId: string, code: string, options: LoginOptions = {}) => {
    try {
      const res = await http.post<LoginSuccessResponse>('/auth/verify-2fa', {
        userId,
        code
      })
      await applyLoginPayload(res, options)
      return true
    } catch (e: any) {
      handleError(e)
      return false
    }
  }

  /**
   * 注册新用户。
   * 
   * @async
   * @param {string} username - 注册用户名
   * @param {string} password - 密码
   * @param {string} confirmPassword - 确认密码
   * @param {string} phone - 手机号 (可选)
   * @returns {Promise<boolean>} 注册成功返回 true，否则返回 false
   */
  const register = async (username: string, password: string, confirmPassword: string, phone?: string) => {
    try {
      const res = await http.post<{ success: boolean; message: string; user: User }>('/auth/register', {
        username,
        password,
        confirmPassword,
        phone
      })
      toast.success(t('toast.registerSuccess'))
      // 注册成功后自动登录
      token.value = `user-jwt-token-${res.user._id}` // 使用新用户的 _id 生成 token
      user.value = res.user
      await login(username, password) // 重新调用 login 确保所有状态正确设置
      return true
    } catch (e: any) {
      handleError(e)
      return false
    }
  }

  /**
   * 退出当前用户：清空 token 与用户状态。
   * 退出后跳转到登录页。
   */
  const logout = () => {
    token.value = null
    user.value = null
    // toast.info('已退出登录')
    resetCartLocal()
    resetWishlistLocal()
    resetOrdersLocal()
    router.push('/login')
  }

  return {
    user,
    token,
    isAuthenticated: computed(() => !!user.value),
    login,
    verifyTwoFactorLogin,
    logout,
    register
  }
}

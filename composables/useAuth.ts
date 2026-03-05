import { useCart } from '~/modules/cart/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import { useOrders } from '~/modules/order/composables/useOrders'
/**
 * 表示已登录用户的接口。
 * @interface User
 * @property {number} id - 用户唯一标识
 * @property {string} username - 登录用户名
 * @property {string} name - 展示名称
 * @property {string} role - 用户角色（如 admin、user）
 * @property {string} avatar - 头像 URL
 */
export interface User {
  id: number
  username: string
  name: string
  role: string
  avatar: string
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

  /**
   * 使用用户名与密码进行登录认证。
   * 
   * @async
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 登录成功返回 true，否则返回 false
   */
  const login = async (username: string, password: string) => {
    try {
      const res = await $fetch<{ token: string; user: User }>('/api/auth/login' as any, {
        method: 'POST',
        body: { username, password }
      })
      token.value = res.token
      user.value = res.user as User
      toast.success('登录成功')
      resetCartLocal()
      resetWishlistLocal()
      resetOrdersLocal()
      await nextTick()
      await refreshCart()
      await refreshWishlist()
      await refreshOrders()
      await router.push('/')
      return true
    } catch (e: any) {
      toast.error(e.message || '发生错误')
      return false
    }
  }

  /**
   * 注册新用户。
   * 
   * @async
   * @param {string} username - 注册用户名
   * @param {string} password - 密码
   * @param {string} phone - 手机号
   * @returns {Promise<boolean>} 注册成功返回 true，否则返回 false
   */
  const register = async (username: string, password: string, confirmPassword: string, phone?: string) => {
    try {
      await $fetch('/api/auth/register' as any, {
        method: 'POST',
        body: { username, password, confirmPassword, phone }
      })
      toast.success('注册成功！请登录。')
      await login(username, password)
      return true
    } catch (e: any) {
      toast.error(e?.data?.statusMessage || e.message || '注册过程中发生错误')
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
    toast.info('已退出登录')
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
    logout,
    register
  }
}

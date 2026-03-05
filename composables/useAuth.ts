import { useCart } from '~/modules/cart/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import { useOrders } from '~/modules/order/composables/useOrders'
/**
 * User interface representing a logged-in user.
 * @interface User
 * @property {number} id - Unique identifier for the user
 * @property {string} username - User's login username
 * @property {string} name - User's display name
 * @property {string} role - User's role (e.g., 'admin', 'user')
 * @property {string} avatar - URL to the user's avatar image
 */
export interface User {
  id: number
  username: string
  name: string
  role: string
  avatar: string
}

/**
 * Composable for managing authentication state and actions.
 * Provides methods to login, logout, and access current user information.
 * 
 * @returns {Object} Authentication state and methods
 * @property {Ref<User | null>} user - Current logged-in user state
 * @property {CookieRef<string | null>} token - Authentication token cookie
 * @property {ComputedRef<boolean>} isAuthenticated - Computed property indicating if user is logged in
 * @property {Function} login - Function to handle user login
 * @property {Function} logout - Function to handle user logout
 */
export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const token = useCookie('auth-token', {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax'
  })
  const toast = useToast()
  const router = useRouter()
  const { resetCartLocal, refreshCart } = useCart()
  const { resetWishlistLocal, refreshWishlist } = useWishlist()
  const { resetOrdersLocal, refreshOrders } = useOrders()

  /**
   * Authenticates a user with username and password.
   * 
   * @async
   * @param {string} username - The username to login with
   * @param {string} password - The password to login with
   * @returns {Promise<boolean>} True if login successful, false otherwise
   */
  const login = async (username: string, password: string) => {
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      }) as { token: string, user: User }
      token.value = res.token
      user.value = res.user as User
      toast.success('Login successful')
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
      toast.error(e.message || 'An error occurred')
      return false
    }
  }

  /**
   * Registers a new user.
   * 
   * @async
   * @param {string} username - The username to register
   * @param {string} password - The password
   * @param {string} phone - The phone number
   * @returns {Promise<boolean>} True if registration successful, false otherwise
   */
  const register = async (username: string, password: string, confirmPassword: string, phone?: string) => {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, password, confirmPassword, phone }
      })
      toast.success('Registration successful! Please login.')
      await login(username, password)
      return true
    } catch (e: any) {
      toast.error(e?.data?.statusMessage || e.message || 'An error occurred during registration')
      return false
    }
  }

  /**
   * Logs out the current user by clearing token and user state.
   * Redirects to login page after logout.
   */
  const logout = () => {
    token.value = null
    user.value = null
    toast.info('Logged out')
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

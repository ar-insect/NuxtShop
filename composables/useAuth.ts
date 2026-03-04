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
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (error.value) {
        toast.error(error.value.statusMessage || 'Login failed')
        return false
      }

      if (data.value) {
        token.value = data.value.token
        user.value = data.value.user
        toast.success('Login successful')
        await router.push('/')
        return true
      }
      return false
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
  const register = async (username: string, password: string, phone?: string) => {
    try {
      const { error } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: { username, password, phone }
      })

      if (error.value) {
        toast.error(error.value.statusMessage || 'Registration failed')
        return false
      }

      toast.success('Registration successful! Please login.')
      // router.push('/login') // Removed redirect, handled by UI flow
      return true
    } catch (e: any) {
      toast.error(e.message || 'An error occurred during registration')
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

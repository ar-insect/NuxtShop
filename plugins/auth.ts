import type { User } from '~/composables/useAuth'
import { useThemeStore } from '~/stores/theme'
import { useCart } from '~/modules/cart/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import { useOrders } from '~/modules/order/composables/useOrders'

export default defineNuxtPlugin(async () => {
  const user = useState<User | null>('auth-user')
  const themeStore = useThemeStore()
  const syncing = useState<boolean>('user-syncing', () => false)
  const sessionCookie = import.meta.server ? useCookie('ns_auth_session') : null

  const { refreshCart } = useCart()
  const { refreshWishlist } = useWishlist()
  const { refreshOrders } = useOrders()

  const syncUserData = async () => {
    if (!user.value?._id) return
    syncing.value = true
    try {
      await Promise.all([
        themeStore.fetchTheme(),
        refreshCart(),
        refreshWishlist(),
        refreshOrders()
      ])
    } finally {
      syncing.value = false
    }
  }

  if (!user.value) {
    const shouldFetchCurrentUser = import.meta.server
      ? Boolean(sessionCookie?.value)
      : false

    if (!shouldFetchCurrentUser) {
      user.value = null
      return
    }

    try {
      const { data, error } = await useFetch('/api/auth/me')
      if (data.value) {
        user.value = data.value.user as User
        await syncUserData()
      } else if (error.value) {
        user.value = null
      }
    } catch {
      user.value = null
    }
  } else if (user.value?._id) {
    await syncUserData()
  }
})

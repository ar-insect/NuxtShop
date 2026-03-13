import type { User } from '~/composables/useAuth'
import { useThemeStore } from '~/stores/theme'
import { useCart } from '~/modules/cart/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import { useOrders } from '~/modules/order/composables/useOrders'

export default defineNuxtPlugin(async () => {
  const user = useState<User | null>('auth-user')
  const token = useCookie('auth-token')
  const themeStore = useThemeStore()

  const { refreshCart } = useCart()
  const { refreshWishlist } = useWishlist()
  const { refreshOrders } = useOrders()

  const syncUserData = async () => {
    if (!user.value?._id) return
    await Promise.all([
      themeStore.fetchTheme(),
      refreshCart(),
      refreshWishlist(),
      refreshOrders()
    ])
  }

  if (token.value && !user.value) {
    try {
      const { data, error } = await useFetch('/api/auth/me')
      if (data.value) {
        user.value = data.value.user as User
        await syncUserData()
      } else if (error.value) {
        token.value = null
      }
    } catch {
      token.value = null
    }
  } else if (user.value?._id) {
    await syncUserData()
  }
})

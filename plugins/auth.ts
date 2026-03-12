import type { User } from '~/composables/useAuth'
import { useThemeStore } from '~/stores/theme' // 导入 themeStore

export default defineNuxtPlugin(async () => {
  const user = useState<User | null>('auth-user')
  const token = useCookie('auth-token')
  const themeStore = useThemeStore() // 获取 themeStore 实例

  if (token.value && !user.value) {
    try {
      const { data, error } = await useFetch('/api/auth/me')
      if (data.value) {
        user.value = data.value.user as User
        // 在用户登录后，获取用户的偏好设置
        if (user.value._id && token.value) { // 确保 userId 和 token 都存在
          await themeStore.fetchTheme(token.value)
        }
      } else if (error.value) {
        // Token invalid
        token.value = null
      }
    } catch {
      token.value = null
    }
  } else if (user.value?._id && token.value) { // 如果用户已经登录（例如，页面刷新），也获取偏好设置
    await themeStore.fetchTheme(token.value)
  }
})

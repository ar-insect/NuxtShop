import type { User } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const user = useState<User | null>('auth-user', () => null)
  const restoreCurrentUser = async () => {
    const response = await $fetch<{ user: User }>('/api/auth/me', import.meta.server
      ? { headers: useRequestHeaders(['cookie']) }
      : undefined)
    user.value = response.user
  }

  if (!user.value?._id && import.meta.server) {
    const sessionCookie = useCookie('ns_auth_session')
    if (!sessionCookie.value) {
      return navigateTo('/login')
    }

    try {
      const headers = useRequestHeaders(['cookie'])
      const response = await $fetch<{ user: User }>('/api/auth/me', { headers })
      user.value = response.user
    } catch {
      user.value = null
      return navigateTo('/login')
    }
  }

  if (import.meta.client) {
    try {
      await restoreCurrentUser()
    } catch {
      user.value = null
      return navigateTo('/login')
    }
  }

  if (!user.value || user.value.role !== 'admin') {
    return navigateTo('/login')
  }
})

import type { User } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const user = useState<User | null>('auth-user', () => null)
  const restoreCurrentUser = async () => {
    const response = await $fetch<{ user: User }>('/api/auth/me', import.meta.server
      ? { headers: useRequestHeaders(['cookie']) }
      : undefined)
    user.value = response.user
  }

  if (user.value?._id && import.meta.client) {
    try {
      await restoreCurrentUser()
      return
    } catch {
      user.value = null
      return navigateTo('/login')
    }
  }

  if (import.meta.server) {
    const sessionCookie = useCookie('ns_auth_session')
    if (!sessionCookie.value) {
      return navigateTo('/login')
    }

    try {
      await restoreCurrentUser()
      return
    } catch {
      user.value = null
      return navigateTo('/login')
    }
  }

  if (import.meta.client) {
    try {
      await restoreCurrentUser()
      return
    } catch {
      user.value = null
      return navigateTo('/login')
    }
  }
  return navigateTo('/login')
})

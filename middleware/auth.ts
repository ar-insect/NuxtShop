export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()

  // 若用户未登录且访问受保护路由
  if (!isAuthenticated.value) {
    // 跳转到登录页
    return navigateTo('/login')
  }
})

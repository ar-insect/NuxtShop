export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/user')) return
  console.log('User module middleware:', to.path)
})

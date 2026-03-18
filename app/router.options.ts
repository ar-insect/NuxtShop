import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash && import.meta.client) {
      const el = document.querySelector(to.hash)
      if (el) {
        return {
          el,
          behavior: 'smooth'
        }
      }
      return { left: 0, top: 0 }
    }

    return { left: 0, top: 0 }
  }
}

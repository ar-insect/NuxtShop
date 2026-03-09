<template>
  <header
    class="sticky top-0 z-50 w-full backdrop-blur-xl border-b"
    :style="{
      backgroundColor: 'color-mix(in srgb, var(--primary-color) 8%, var(--card-bg) 92%)',
      opacity: '0.92',
      borderColor: 'color-mix(in srgb, var(--primary-color) 14%, var(--border-color))'
    }"
  >
    <div class="w-full px-6 h-16 flex items-center justify-between">
      <!-- Left Side: Logo & Navigation -->
      <div class="flex items-center gap-8">
        <!-- Logo Area -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20" style="border-radius: var(--border-radius);">
            N
          </div>
          <span class="text-xl font-bold" :style="{ color: 'var(--text-color)' }">
            NuxtShop
          </span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <ul class="flex items-center gap-1">
            <li v-for="link in mainLinks" :key="link.to">
              <NuxtLink 
                :to="link.to"
                class="px-3 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-200"
                active-class="text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-semibold shadow-sm"
                :style="{ borderRadius: 'var(--border-radius)', color: 'var(--text-secondary)' }"
                @click.prevent="navigateTo(link.to)"
              >
                {{ link.text }}
              </NuxtLink>
            </li>
            
            <!-- Demos Dropdown -->
            <li class="relative group">
              <BaseDropdown label="演示" :close-on-click="true">
                <template #trigger="{ isOpen }">
                  <button
                    class="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-200"
                    :style="{ borderRadius: 'var(--border-radius)', color: 'var(--text-secondary)' }"
                  >
                    演示
                    <svg 
                      class="h-4 w-4 transition-transform duration-200" 
                      :class="{ 'rotate-180': isOpen }"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </template>
                
                <template #default="{ close }">
                  <NuxtLink 
                    v-for="link in demoLinks" 
                    :key="link.to"
                    :to="link.to"
                    class="block px-4 py-2 text-sm hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
                    active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium"
                    :style="{ color: 'var(--text-color)' }"
                    @click="close"
                  >
                    {{ link.text }}
                  </NuxtLink>
                </template>
              </BaseDropdown>
            </li>

            <!-- Support Dropdown -->
            <li class="relative group">
              <BaseDropdown label="技术支持" :close-on-click="true">
                <template #trigger="{ isOpen }">
                  <button
                    class="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-200"
                    :style="{ borderRadius: 'var(--border-radius)', color: 'var(--text-secondary)' }"
                  >
                    技术支持
                    <svg 
                      class="h-4 w-4 transition-transform duration-200" 
                      :class="{ 'rotate-180': isOpen }"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </template>
                
                <template #default="{ close }">
                  <a 
                    href="https://github.com/ar-insect/NuxtShop"
                    target="_blank"
                    class="block px-4 py-2 text-sm hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
                    :style="{ color: 'var(--text-color)' }"
                    @click="close"
                  >
                    GitHub 仓库
                  </a>
                  <a 
                    href="https://github.com/ar-insect/NuxtShop/issues"
                    target="_blank"
                    class="block px-4 py-2 text-sm hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
                    :style="{ color: 'var(--text-color)' }"
                    @click="close"
                  >
                    提交 Issues
                  </a>
                </template>
              </BaseDropdown>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Right Side: Cart, Wishlist & User Actions -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Cart & Wishlist -->
        <div v-if="user" class="flex items-center gap-2 border-r pr-4 mr-4" :style="{ borderColor: 'var(--border-color)' }">
          <NuxtLink to="/wishlist" class="relative p-2 hover:text-red-500 transition-colors" :style="{ color: 'var(--text-secondary)' }" title="收藏夹">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <ClientOnly>
              <span v-if="wishlistItems.length > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {{ wishlistItems.length }}
              </span>
            </ClientOnly>
          </NuxtLink>
          <NuxtLink to="/cart" class="relative p-2 hover:text-[var(--primary-color)] transition-colors" :style="{ color: 'var(--text-secondary)' }" title="购物车">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <ClientOnly>
              <span v-if="cartCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[var(--primary-color)] rounded-full">
                {{ cartCount }}
              </span>
            </ClientOnly>
          </NuxtLink>
        </div>

        <!-- User Actions -->
        <div v-if="user" class="flex items-center gap-3">
          <NuxtLink to="/profile" class="flex items-center gap-2 text-sm font-medium hover:text-[var(--primary-color)] transition-colors" :style="{ color: 'var(--text-color)' }">
            <img v-if="user.avatar" :src="user.avatar" class="w-8 h-8 rounded-full border" :style="{ borderColor: 'var(--border-color)' }" alt="用户" >
            <span>{{ user.name }}</span>
          </NuxtLink>
          <BaseButton 
            variant="link" 
            size="sm"
            class="px-4 py-2 text-sm font-medium"
            @click="logout"
          >
            退出登录
          </BaseButton>
        </div>
        <div v-else class="flex items-center gap-2">
          <BaseButton 
            variant="link"
            size="sm"
            class="px-2 text-sm font-medium transition-colors"
            @click="openLoginModal"
          >
            登录
          </BaseButton>
          <span class="text-gray-300">/</span>
          <NuxtLink to="/register">
            <BaseButton
              variant="link"
              size="sm"
              class="px-2 text-sm font-medium transition-colors text-red-500 hover:text-red-600"
            >
              注册
            </BaseButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Mobile Menu Button (Placeholder) -->
      <button class="md:hidden p-2 rounded-md transition-colors hover:bg-black/5" :style="{ color: 'var(--text-secondary)' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    
    <ClientOnly>
      <AuthLoginModal />
    </ClientOnly>
  </header>
</template>

<script setup lang="ts">
import BaseDropdown from '~/components/ui/BaseDropdown.vue'

const { user, logout } = useAuth()
const { cartCount } = useCart()
const { wishlistItems } = useWishlist()
const { openLoginModal } = useLoginModal()
const mainLinks = [
  { to: '/', text: '首页' },
  { to: '/products', text: '商品' },
  { to: '/docs', text: '文档' },
]

const demoLinks = [
  { to: '/components-demo', text: 'UI 组件' },
  { to: '/pinia-demo', text: '状态管理 (Pinia)' },
  { to: '/http-demo', text: 'HTTP 请求' },
  { to: '/ssr-demo', text: 'SSR 渲染' },
  { to: '/plugins-demo', text: '插件机制' },
  { to: '/utils-demo', text: '工具函数' },
  { to: '/types-demo', text: 'TypeScript 类型' },
  { to: '/tsx-demo', text: 'TSX 支持' },
  { to: '/styled-demo', text: 'Styled Components' },
  { to: '/bdd-demo', text: 'BDD 测试演示' },
]
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

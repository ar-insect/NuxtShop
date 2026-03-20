<template>
  <header class="sticky top-0 z-50 w-full backdrop-blur-xl border-b relative" :style="headerStyle">
    <transition name="fade">
      <div
        v-if="syncing"
        class="absolute top-0 left-0 right-0 h-0.5 overflow-hidden"
      >
        <div class="w-full h-full bg-gradient-to-r from-[var(--primary-color)] via-sky-400 to-emerald-400 animate-pulse" />
      </div>
    </transition>
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
                class="px-3 py-2 text-sm font-medium transition-all duration-200"
                :class="link.to === currentPath 
                  ? 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-semibold shadow-sm' 
                  : 'hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 text-[var(--text-secondary)]'"
                :aria-current="link.to === currentPath ? 'page' : undefined"
                :style="{ borderRadius: 'var(--border-radius)' }"
              >
                {{ link.text }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Right Side: Cart, Wishlist & User Actions -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Cart & Wishlist -->
        <div v-if="user" class="flex items-center gap-4 border-r pr-4 mr-4" :style="{ borderColor: 'var(--border-color)' }">
          <NuxtLink
            to="/wishlist"
            class="relative flex flex-col items-center gap-1 px-2 py-1 transition-colors"
            :class="currentPath.startsWith('/wishlist') ? 'text-red-500' : 'hover:text-red-500 text-[var(--text-secondary)]'"
            :title="t('nav.wishlist')"
            :aria-current="currentPath.startsWith('/wishlist') ? 'page' : undefined"
          >
            <span class="relative inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <ClientOnly>
                <span v-if="wishlistItems.length > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {{ wishlistItems.length }}
                </span>
              </ClientOnly>
            </span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">
              {{ t('nav.wishlist') }}
            </span>
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="relative flex flex-col items-center gap-1 px-2 py-1 transition-colors"
            :class="currentPath.startsWith('/cart') ? 'text-[var(--primary-color)]' : 'hover:text-[var(--primary-color)] text-[var(--text-secondary)]'"
            :title="t('nav.cart')"
            :aria-current="currentPath.startsWith('/cart') ? 'page' : undefined"
          >
            <span class="relative inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <ClientOnly>
                <span v-if="cartCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[var(--primary-color)] rounded-full">
                  {{ cartCount }}
                </span>
              </ClientOnly>
            </span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">
              {{ t('nav.cart') }}
            </span>
          </NuxtLink>
        </div>

        <!-- User Actions -->
        <div v-if="user" class="flex items-center gap-3">
          <BaseDropdown :label="displayName" :close-on-click="true">
            <template #trigger="{ isOpen }">
              <button
                class="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--primary-color)]"
                :style="{ color: 'var(--text-color)' }"
              >
                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  class="w-8 h-8 rounded-full border"
                  :style="{ borderColor: 'var(--border-color)' }"
                  alt="用户"
                >
                <div
                  v-else
                  class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold bg-[var(--card-bg)]"
                  :style="{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }"
                >
                  {{ displayName.charAt(0).toUpperCase() }}
                </div>
                <span>{{ displayName }}</span>
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
              <div class="px-4 pt-2 pb-1 text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
                {{ t('nav.profile') }}
              </div>
              <NuxtLink
                to="/profile"
                class="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                :class="currentPath.startsWith('/profile') 
                  ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium' 
                  : 'hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] text-[var(--text-color)]'"
                :aria-current="currentPath.startsWith('/profile') ? 'page' : undefined"
                @click="close"
              >
                <UserCircleIcon class="h-4 w-4" />
                <span>{{ t('nav.profile') }}</span>
              </NuxtLink>
              <NuxtLink
                to="/orders"
                class="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                :class="currentPath.startsWith('/orders') 
                  ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium' 
                  : 'hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] text-[var(--text-color)]'"
                :aria-current="currentPath.startsWith('/orders') ? 'page' : undefined"
                @click="close"
              >
                <ClipboardDocumentListIcon class="h-4 w-4" />
                <span>{{ t('nav.orders') }}</span>
              </NuxtLink>
              <div class="my-1 border-t" :style="{ borderColor: 'var(--border-color)' }" />
              <div class="px-4 pt-2 pb-1 text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
                {{ t('nav.docs') }} & {{ t('nav.demos') }}
              </div>
              <NuxtLink
                to="/docs"
                class="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                :class="currentPath.startsWith('/docs') 
                  ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium' 
                  : 'hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] text-[var(--text-color)]'"
                :aria-current="currentPath.startsWith('/docs') ? 'page' : undefined"
                @click="close"
              >
                <BookOpenIcon class="h-4 w-4" />
                <span>{{ t('nav.docs') }}</span>
              </NuxtLink>
              <NuxtLink
                v-for="link in demoLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-2 px-4 py-1.5 text-sm transition-colors"
                :class="currentPath.startsWith(link.to) 
                  ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium' 
                  : 'hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] text-[var(--text-color)]'"
                :aria-current="currentPath.startsWith(link.to) ? 'page' : undefined"
                @click="close"
              >
                <BeakerIcon class="h-4 w-4" />
                <span>{{ link.text }}</span>
              </NuxtLink>
              <button
                type="button"
                class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                @click="() => { close(); logout() }"
              >
                {{ t('profile.logoutConfirm') }}
              </button>
            </template>
          </BaseDropdown>
        </div>
        <div v-else class="flex items-center gap-2">
          <BaseButton 
            variant="link"
            size="sm"
            class="px-2 text-sm font-medium transition-colors"
            @click="openLoginModal"
          >
            {{ t('nav.login') }}
          </BaseButton>
          <span class="text-gray-300">/</span>
          <NuxtLink to="/register">
            <BaseButton
              variant="link"
              size="sm"
              class="px-2 text-sm font-medium transition-colors text-red-500 hover:text-red-600"
            >
              {{ t('nav.register') }}
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
import { UserCircleIcon, ClipboardDocumentListIcon, ShieldCheckIcon, BookOpenIcon, BeakerIcon } from '@heroicons/vue/24/outline'
import BaseDropdown from '~/components/ui/BaseDropdown.vue'
import { useI18n } from '~/composables/useI18n'

const { user, logout } = useAuth()
const { cartCount } = useCart()
const { wishlistItems } = useWishlist()
const { openLoginModal } = useLoginModal()
const route = useRoute()
const syncing = useState<boolean>('user-syncing', () => false)
const { t } = useI18n()

const headerStyle = computed(() => ({
  backgroundColor: 'color-mix(in srgb, var(--primary-color) 8%, var(--card-bg) 92%)',
  opacity: '0.92',
  borderColor: 'color-mix(in srgb, var(--primary-color) 14%, var(--border-color))'
}))

const currentPath = computed(() => route.path)
const displayName = computed(() => user.value?.name || user.value?.username || '账户')
const mainLinks = computed(() => [
  { to: '/', text: t('nav.home') },
  { to: '/products', text: t('nav.products') }
])

const demoLinks = computed(() => [
  { to: '/demos/components', text: t('nav.demoMenu.ui') },
  { to: '/demos/pinia', text: t('nav.demoMenu.pinia') },
  { to: '/demos/http', text: t('nav.demoMenu.http') },
  { to: '/demos/ssr', text: t('nav.demoMenu.ssr') },
  { to: '/demos/plugins', text: t('nav.demoMenu.plugins') },
  { to: '/demos/utils', text: t('nav.demoMenu.utils') },
  { to: '/demos/types', text: t('nav.demoMenu.types') },
  { to: '/demos/tsx', text: t('nav.demoMenu.tsx') },
  { to: '/demos/styled', text: t('nav.demoMenu.styled') },
  { to: '/demos/bdd', text: t('nav.demoMenu.bdd') }
])
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

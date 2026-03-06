<template>
  <div class="min-h-screen font-sans" :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }">
    <div class="flex h-screen overflow-hidden">
      <!-- Main content -->
      <div class="flex flex-1 flex-col overflow-hidden relative">
        <header
          class="absolute top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-xl transition-all duration-300"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--primary-color) 8%, color-mix(in srgb, var(--card-bg) 88%, transparent))',
            borderColor: 'color-mix(in srgb, var(--primary-color) 18%, var(--border-color))'
          }"
        >
          <div class="flex items-center gap-3">
            <div class="md:hidden">
              <BaseDropdown :close-on-click="true">
                <template #trigger="{ isOpen }">
                  <button
                    class="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-black/5"
                    :style="{ color: 'var(--text-secondary)' }"
                    type="button"
                    aria-label="打开菜单"
                  >
                    <SvgIcon name="bars-3" class="h-6 w-6" />
                    <SvgIcon
                      name="chevron-down"
                      class="h-4 w-4 ml-1 transition-transform duration-200"
                      :class="{ 'rotate-180': isOpen }"
                    />
                  </button>
                </template>
                <template #default="{ close }">
                  <NuxtLink
                    v-for="link in dashboardLinks"
                    :key="link.to"
                    :to="link.to"
                    class="block px-4 py-2 text-sm hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
                    active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium"
                    :style="{ color: 'var(--text-color)' }"
                    @click="close"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </template>
              </BaseDropdown>
            </div>

            <NuxtLink to="/" class="text-lg font-bold" :style="{ color: 'var(--primary-color)' }">NuxtShop</NuxtLink>
          </div>

          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="link in dashboardLinks"
              :key="link.to"
              :to="link.to"
              class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              :style="{ color: 'var(--text-secondary)' }"
              active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
            >
              <SvgIcon :name="link.icon" class="mr-2 h-5 w-5 flex-shrink-0" :style="{ color: 'var(--text-secondary)' }" />
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div />
        </header>
        <main class="flex-1 overflow-y-auto pt-16 p-6" :style="{ backgroundColor: 'var(--bg-color)' }">
          <slot />
        </main>
      </div>
    </div>
    
    <BaseToast />
    <BaseModal />
    <BaseConfirm />
  </div>
</template>

<script setup lang="ts">
const dashboardLinks = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/profile', label: '个人中心', icon: 'user' },
  { to: '/cart', label: '购物车', icon: 'shopping-cart' },
  { to: '/wishlist', label: '收藏夹', icon: 'heart' },
]
</script>

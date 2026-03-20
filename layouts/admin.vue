<template>
  <div class="min-h-screen font-sans" :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }">
    <div class="flex h-screen overflow-hidden">
      <aside
        class="hidden md:flex w-64 flex-col border-r"
        :style="{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }"
      >
        <div class="h-16 flex items-center px-4 border-b" :style="{ borderColor: 'var(--border-color)' }">
          <NuxtLink to="/" class="text-lg font-bold flex items-center gap-2">
            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--primary-color)] text-white text-sm">
              N
            </span>
            <span>NuxtShop Admin</span>
          </NuxtLink>
        </div>
        <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          <NuxtLink
            v-for="item in adminLinks"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
            :class="isActive(item.to)
              ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]'"
          >
            <SvgIcon :name="item.icon" class="h-5 w-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <div class="flex flex-1 flex-col overflow-hidden">
        <header
          class="md:hidden flex items-center justify-between h-14 px-4 border-b"
          :style="{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }"
        >
          <NuxtLink to="/" class="text-base font-bold" :style="{ color: 'var(--primary-color)' }">
            NuxtShop Admin
          </NuxtLink>
        </header>

        <main class="flex-1 overflow-y-auto p-4 md:p-6">
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
const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (to: string) => {
  if (to === '/admin') {
    return currentPath.value === '/admin'
  }
  return currentPath.value === to || currentPath.value.startsWith(`${to}/`)
}

const adminLinks = computed(() => [
  { to: '/admin', label: '概览', icon: 'home' },
  { to: '/admin/goods', label: '商品管理', icon: 'squares-2x2' },
  { to: '/admin/order', label: '订单管理', icon: 'receipt-percent' },
  { to: '/admin/user', label: '用户管理', icon: 'users' },
  { to: '/admin/marketing/coupon', label: '优惠券管理', icon: 'ticket' },
  { to: '/admin/marketing/ads', label: '广告管理', icon: 'rectangle-group' },
  { to: '/admin/system/admin', label: '管理员账号', icon: 'shield-check' },
  { to: '/admin/system/setting', label: '系统配置', icon: 'cog-6-tooth' }
])
</script>

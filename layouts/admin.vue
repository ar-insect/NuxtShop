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
            <span>{{ t('nav.admin') }}</span>
          </NuxtLink>
        </div>
        <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          <template v-for="item in adminNav" :key="item.key">
            <NuxtLink
              v-if="item.type === 'item'"
              :to="item.to"
              class="flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
              :class="isActive(item.to!)
                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium'
                : 'text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]'"
            >
              <SvgIcon :name="item.icon" class="h-5 w-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>

            <div v-else class="space-y-0.5">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer select-none text-left"
                :class="isGroupActive(item.children)
                  ? 'text-[var(--primary-color)] font-medium'
                  : 'text-[var(--text-secondary)]'"
                @click="toggleGroup(item.key, item.children)"
              >
                <SvgIcon :name="item.icon" class="h-5 w-5" />
                <span class="flex-1">{{ item.label }}</span>
                <svg
                  class="h-3 w-3 transition-transform"
                  :class="isGroupOpen(item.key, item.children) ? 'rotate-90' : ''"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-if="isGroupOpen(item.key, item.children)" class="space-y-0.5">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="flex items-center gap-2 rounded-md px-3 py-1.5 ml-6 transition-colors"
                  :class="isActive(child.to!)
                    ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]'"
                >
                  <span class="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                  <span>{{ child.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </template>
        </nav>
      </aside>

      <div class="flex flex-1 flex-col overflow-hidden">
        <header
          class="md:hidden flex items-center justify-between h-14 px-4 border-b"
          :style="{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }"
        >
          <NuxtLink to="/" class="text-base font-bold" :style="{ color: 'var(--primary-color)' }">
            {{ t('nav.admin') }}
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
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (to?: string) => {
  if (!to) return false

  const path = currentPath.value

  if (to === '/admin') {
    return path === '/admin'
  }

  if (to === '/admin/goods') {
    // 商品列表：/admin/goods 以及新增/编辑子路由高亮
    if (path === '/admin/goods') return true
    if (path.startsWith('/admin/goods/create')) return true
    if (path.startsWith('/admin/goods/')) {
      // 排除分类与评价
      if (path.startsWith('/admin/goods/category')) return false
      if (path.startsWith('/admin/goods/review')) return false
      return true
    }
    return false
  }

  return path === to || path.startsWith(`${to}/`)
}

const adminNav = computed(() => [
  {
    key: 'dashboard',
    type: 'item',
    to: '/admin',
    label: t('admin.sidebar.dashboard'),
    icon: 'home'
  },
  {
    key: 'goods',
    type: 'group',
    label: t('admin.sidebar.goods'),
    icon: 'squares-2x2',
    children: [
      { to: '/admin/goods', label: t('admin.sidebar.goodsList') },
      { to: '/admin/goods/category', label: t('admin.sidebar.goodsCategory') },
      { to: '/admin/goods/review', label: t('admin.sidebar.goodsReview') }
    ]
  },
  {
    key: 'order',
    type: 'item',
    to: '/admin/order',
    label: t('admin.sidebar.order'),
    icon: 'receipt-percent'
  },
  {
    key: 'user',
    type: 'item',
    to: '/admin/user',
    label: t('admin.sidebar.user'),
    icon: 'users'
  },
  {
    key: 'marketing',
    type: 'group',
    label: t('admin.sidebar.marketing'),
    icon: 'rectangle-group',
    children: [
      { to: '/admin/marketing/coupon', label: t('admin.sidebar.coupon') },
      { to: '/admin/marketing/ads', label: t('admin.sidebar.ads') }
    ]
  },
  {
    key: 'system',
    type: 'group',
    label: t('admin.sidebar.system'),
    icon: 'cog-6-tooth',
    children: [
      { to: '/admin/system/admin', label: t('admin.sidebar.systemAdmin') },
      { to: '/admin/system/setting', label: t('admin.sidebar.systemSetting') }
    ]
  }
])

const isGroupActive = (children?: { to: string }[]) => {
  if (!children || children.length === 0) return false
  return children.some(child => isActive(child.to))
}

const openGroups = ref<Record<string, boolean>>({})

const isGroupOpen = (key: string, children?: { to: string }[]) => {
  if (openGroups.value[key] === undefined) {
    // 默认：当前路由命中该分组任一子路由时展开，否则折叠
    openGroups.value[key] = !!children && isGroupActive(children)
  }
  return openGroups.value[key]
}

const toggleGroup = (key: string, children?: { to: string }[]) => {
  const current = isGroupOpen(key, children)
  openGroups.value[key] = !current
}
</script>

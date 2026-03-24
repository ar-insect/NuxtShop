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

        <div class="flex-1 flex flex-col overflow-hidden">
          <div
            class="flex items-center gap-1 px-3 pt-2 border-b bg-[var(--card-bg)] overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin"
            :style="{ borderColor: 'var(--border-color)' }"
          >
            <button
              v-for="tab in tabs"
              :key="tab.path"
              type="button"
              class="inline-flex items-center max-w-xs rounded-t-lg px-3 py-1.5 text-xs md:text-sm border border-b-0 -mb-px transition-colors transition-shadow duration-150"
              :class="tab.path === currentPath
                ? 'bg-[var(--bg-color)] text-[var(--text-color)] border-[var(--border-color)] shadow-sm'
                : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]'"
              draggable="true"
              @click="goTab(tab.path)"
              @dblclick.prevent="refreshTab(tab.path)"
              @contextmenu.prevent="openContextMenu($event, tab.path)"
              @dragstart="handleTabDragStart(tab.path)"
              @dragover.prevent="handleTabDragOver(tab.path)"
              @drop.prevent="handleTabDrop(tab.path)"
            >
              <span
                class="truncate"
                :class="tab.path === currentPath ? 'font-medium' : ''"
              >
                {{ tab.title }}
              </span>
              <button
                v-if="tabs.length > 1"
                type="button"
                class="ml-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 px-0.5 py-0.5"
                @click.stop="closeTab(tab.path)"
              >
                <span class="sr-only">Close</span>
                <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </button>
          </div>
          <main class="flex-1 overflow-y-auto p-4 md:p-6">
            <slot />
          </main>
        </div>
      </div>
    </div>

    <BaseToast />
    <BaseModal />
    <BaseConfirm />

    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-40"
      @click="hideContextMenu"
    >
      <div
        class="absolute z-50 w-32 rounded-md border bg-[var(--card-bg)] text-xs shadow-lg py-1"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, borderColor: 'var(--border-color)' }"
        @click.stop
      >
        <button
          type="button"
          class="w-full px-3 py-1.5 text-left hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]"
          @click="closeOthersTabs"
        >
          关闭其它
        </button>
        <button
          type="button"
          class="w-full px-3 py-1.5 text-left hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]"
          @click="closeAllTabs"
        >
          关闭全部
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
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

const flatNavItems = computed(() => {
  const items: { path: string; label: string }[] = []
  adminNav.value.forEach((item) => {
    if (item.type === 'item' && item.to) {
      items.push({ path: item.to, label: item.label })
    } else if (item.children) {
      item.children.forEach((child) => {
        if (child.to) {
          items.push({ path: child.to, label: child.label })
        }
      })
    }
  })
  return items
})

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

interface AdminTab {
  path: string
  title: string
}

const tabs = ref<AdminTab[]>([])
const draggingPath = ref<string | null>(null)
const TAB_STORAGE_KEY = 'nuxtshop-admin-tabs'

const resolveTabTitle = (path: string) => {
  // 商品管理：为新增/编辑页提供更明确的标题
  if (path.startsWith('/admin/goods/create')) {
    return t('admin.goods.form.createTitle')
  }
  if (
    path.startsWith('/admin/goods/') &&
    !path.startsWith('/admin/goods/category') &&
    !path.startsWith('/admin/goods/review')
  ) {
    return t('admin.goods.form.editTitle')
  }

  const items = flatNavItems.value
  const exact = items.find(item => path === item.path)
  if (exact) return exact.label

  const prefix = items.find(item => path.startsWith(`${item.path}/`))
  if (prefix) return prefix.label

  return t('nav.admin')
}

const ensureTab = (path: string) => {
  if (!path.startsWith('/admin')) return
  const existing = tabs.value.find(tab => tab.path === path)
  if (!existing) {
    tabs.value.push({
      path,
      title: resolveTabTitle(path)
    })
  }
}

const findTabIndex = (path: string) => tabs.value.findIndex(tab => tab.path === path)

const handleTabDragStart = (path: string) => {
  draggingPath.value = path
}

const handleTabDragOver = (targetPath: string) => {
  if (!draggingPath.value || draggingPath.value === targetPath) return
}

const handleTabDrop = (targetPath: string) => {
  const sourcePath = draggingPath.value
  draggingPath.value = null
  if (!sourcePath || sourcePath === targetPath) return
  const fromIndex = findTabIndex(sourcePath)
  const toIndex = findTabIndex(targetPath)
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
  const updated = [...tabs.value]
  const [moved] = updated.splice(fromIndex, 1)
  updated.splice(toIndex, 0, moved)
  tabs.value = updated
}

watch(
  currentPath,
  (path) => {
    if (!path.startsWith('/admin')) return
    ensureTab(path)
  },
  { immediate: true }
)

if (import.meta.client) {
  watch(
    tabs,
    (value) => {
      const paths = value.map(tab => tab.path)
      window.localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(paths))
    },
    { deep: true }
  )
}

onMounted(() => {
  try {
    const raw = window.localStorage.getItem(TAB_STORAGE_KEY)
    if (raw) {
      const savedPaths = Array.from(
        new Set<string>((JSON.parse(raw) as string[]).filter(path => typeof path === 'string' && path.startsWith('/admin')))
      )
      if (savedPaths.length > 0) {
        tabs.value = savedPaths.map(path => ({
          path,
          title: resolveTabTitle(path)
        }))
      }
    }
  } catch {
    // ignore storage errors
  }

  ensureTab(currentPath.value)
})

const goTab = (path: string) => {
  if (path === currentPath.value) return
  router.push(path)
}

const closeTab = (path: string) => {
  const index = tabs.value.findIndex(tab => tab.path === path)
  if (index === -1) return

  const isActive = currentPath.value === path
  tabs.value.splice(index, 1)

  if (!tabs.value.length) {
    tabs.value.push({ path: '/admin', title: resolveTabTitle('/admin') })
    if (isActive) router.push('/admin')
    return
  }

  if (isActive) {
    const next = tabs.value[index] || tabs.value[index - 1] || tabs.value[0]
    router.push(next.path)
  }
}

const refreshTab = (path: string) => {
  if (path !== currentPath.value) {
    router.push(path)
    return
  }
  if (import.meta.client) {
    window.location.reload()
  }
}

const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  path: string | null
}>({
  visible: false,
  x: 0,
  y: 0,
  path: null
})

const openContextMenu = (event: MouseEvent, path: string) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    path
  }
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
}

const closeOthersTabs = () => {
  const path = contextMenu.value.path
  if (!path) {
    hideContextMenu()
    return
  }
  tabs.value = tabs.value.filter(tab => tab.path === path)
  if (currentPath.value !== path) {
    router.push(path)
  }
  hideContextMenu()
}

const closeAllTabs = () => {
  tabs.value = [{ path: '/admin', title: resolveTabTitle('/admin') }]
  if (currentPath.value !== '/admin') {
    router.push('/admin')
  }
  hideContextMenu()
}
</script>

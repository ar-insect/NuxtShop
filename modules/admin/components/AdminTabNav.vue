<template>
  <div
    class="flex items-center px-3 pt-2 border-b bg-[var(--card-bg)]"
    :style="{ borderColor: 'var(--border-color)' }"
  >
    <div
      ref="scrollContainer"
      class="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin"
    >
      <div class="flex items-center gap-1">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.path"
          type="button"
          :data-path="tab.path"
          class="inline-flex items-center max-w-xs rounded-t-lg px-3 py-1.5 text-xs md:text-sm border border-[var(--border-color)] border-b-0 -mb-px transition-colors duration-150"
          :class="tab.path === currentPath
            ? 'text-[var(--primary-color)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'"
          :draggable="!isFixed(tab.path, index)"
          @click="handleClick(tab.path)"
          @dblclick.prevent="emit('refresh', tab.path)"
          @contextmenu.prevent="openContextMenu($event, tab.path)"
          @dragstart="handleDragStart(tab.path)"
          @dragenter.prevent="handleDragEnter(tab.path)"
        >
          <span
            class="truncate"
            :class="tab.path === currentPath ? 'font-medium' : ''"
          >
            {{ tab.title }}
          </span>
          <button
            v-if="tabs.length > 1 && !isFixed(tab.path, index)"
            type="button"
            class="ml-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 px-0.5 py-0.5"
            @click.stop="emit('close', tab.path)"
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
    </div>

    <div
      v-if="tabs.length > 1 && hasOverflow"
      ref="moreRef"
      class="ml-2 relative"
    >
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]"
        @click="toggleMore"
      >
        <span class="sr-only">更多标签</span>
        <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
          <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
        </svg>
      </button>

      <div
        v-if="moreOpen"
        class="absolute right-0 mt-1 w-40 rounded-md border bg-[var(--card-bg)] text-xs shadow-lg py-1 z-40"
        :style="{ borderColor: 'var(--border-color)' }"
      >
        <button
          v-for="tab in tabs"
          :key="tab.path"
          type="button"
          class="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]"
          @click="handleMoreNavigate(tab.path)"
        >
          <span class="truncate">{{ tab.title }}</span>
          <span v-if="tab.path === currentPath" class="ml-2 text-[var(--primary-color)]">●</span>
        </button>
      </div>
    </div>

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
          @click="handleCloseOthers"
        >
          关闭其它
        </button>
        <button
          type="button"
          class="w-full px-3 py-1.5 text-left hover:bg-[var(--primary-color)]/5 hover:text-[var(--primary-color)]"
          @click="handleCloseAll"
        >
          关闭全部
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AdminTab {
  path: string
  title: string
}

const props = defineProps<{
  tabs: AdminTab[]
  currentPath: string
}>()

const emit = defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'refresh', path: string): void
  (e: 'close', path: string): void
  (e: 'reorder', tabs: AdminTab[]): void
  (e: 'close-others', path: string): void
  (e: 'close-all'): void
}>()

const draggingPath = ref<string | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const moreRef = ref<HTMLElement | null>(null)

const isFixed = (path: string, index: number) => {
  // 固定第一个概览标签（/admin），不允许拖拽和关闭
  if (index === 0) return true
  return path === '/admin'
}

const handleClick = (path: string) => {
  emit('navigate', path)
}

const handleDragStart = (path: string) => {
  if (isFixed(path, props.tabs.findIndex(tab => tab.path === path))) return
  draggingPath.value = path
}

const handleDragEnter = (targetPath: string) => {
  if (!draggingPath.value || draggingPath.value === targetPath) return
  const fromIndex = props.tabs.findIndex(tab => tab.path === draggingPath.value)
  const toIndex = props.tabs.findIndex(tab => tab.path === targetPath)
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

  // 不允许拖动或插入到固定标签位置
  if (isFixed(draggingPath.value, fromIndex) || isFixed(targetPath, toIndex)) return
  const reordered = [...props.tabs]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  draggingPath.value = targetPath
  emit('reorder', reordered)
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

const handleCloseOthers = () => {
  const path = contextMenu.value.path
  if (!path) {
    hideContextMenu()
    return
  }
  emit('close-others', path)
  hideContextMenu()
}

const handleCloseAll = () => {
  emit('close-all')
  hideContextMenu()
}

const moreOpen = ref(false)

const toggleMore = () => {
  moreOpen.value = !moreOpen.value
}

const handleMoreNavigate = (path: string) => {
  moreOpen.value = false
  emit('navigate', path)

  nextTick(() => {
    const container = scrollContainer.value
    if (!container) return

    const buttons = container.querySelectorAll<HTMLButtonElement>('button[data-path]')
    let targetLeft = 0
    let targetWidth = 0

    buttons.forEach((btn) => {
      if ((btn.dataset.path || '') === path) {
        targetLeft = btn.offsetLeft
        targetWidth = btn.offsetWidth
      }
    })

    if (!targetWidth) return

    const containerWidth = container.clientWidth

    const targetCenter = targetLeft + targetWidth / 2
    const newScrollLeft = targetCenter - containerWidth / 2

    container.scrollTo({
      left: Math.max(0, newScrollLeft),
      behavior: 'smooth'
    })
  })
}

const handleWindowClick = (event: MouseEvent) => {
  if (!moreOpen.value) return
  const el = moreRef.value
  if (!el) {
    moreOpen.value = false
    return
  }
  if (!el.contains(event.target as Node)) {
    moreOpen.value = false
  }
}

const updateOverflow = () => {
  const el = scrollContainer.value
  if (!el) {
    hasOverflow.value = false
    return
  }
  hasOverflow.value = el.scrollWidth > el.clientWidth + 1
}

onMounted(() => {
  updateOverflow()
  window.addEventListener('resize', updateOverflow)
  window.addEventListener('click', handleWindowClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateOverflow)
  window.removeEventListener('click', handleWindowClick)
})

watch(
  () => props.tabs.map(tab => tab.path),
  () => {
    nextTick(updateOverflow)
  }
)
</script>

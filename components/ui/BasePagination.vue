<template>
  <nav
    v-if="!hideIfSingle || totalPages > 1"
    class="inline-flex items-center gap-2"
    :aria-label="ariaLabelComputed"
  >
    <template v-if="showPrevNext">
      <component
        :is="NuxtLink"
        v-if="getTo && !(disabled || currentPage <= 1)"
        :to="getTo(currentPage - 1)"
        class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border transition-colors"
        :style="controlStyle"
        @click="handlePageClick(currentPage - 1, $event)"
      >
        {{ t('ui.pagination.prev') }}
      </component>
      <button
        v-else
        type="button"
        class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :style="controlStyle"
        :disabled="disabled || currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        {{ t('ui.pagination.prev') }}
      </button>
    </template>

    <div class="flex items-center gap-1">
      <template v-for="(item, idx) in items" :key="`${idx}-${itemKey(item)}`">
        <span
          v-if="item.type === 'ellipsis'"
          class="w-10 h-10 inline-flex items-center justify-center text-sm"
          :style="{ color: 'var(--text-secondary)' }"
        >
          …
        </span>

        <component
          :is="getTo ? NuxtLink : 'button'"
          v-else
          :to="getTo ? getTo(item.page) : undefined"
          type="button"
          class="w-10 h-10 inline-flex items-center justify-center border text-sm font-medium transition-colors"
          :style="pageStyle(item.page)"
          @click="handlePageClick(item.page, $event)"
        >
          {{ item.page }}
        </component>
      </template>
    </div>

    <template v-if="showPrevNext">
      <component
        :is="NuxtLink"
        v-if="getTo && !(disabled || currentPage >= totalPages)"
        :to="getTo(currentPage + 1)"
        class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border transition-colors"
        :style="controlStyle"
        @click="handlePageClick(currentPage + 1, $event)"
      >
        {{ t('ui.pagination.next') }}
      </component>
      <button
        v-else
        type="button"
        class="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :style="controlStyle"
        :disabled="disabled || currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        {{ t('ui.pagination.next') }}
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { useI18n } from '~/composables/useI18n'
import type { RouteLocationRaw } from 'vue-router'

type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis' }

interface Props {
  modelValue?: number
  totalPages: number
  maxVisiblePages?: number
  showPrevNext?: boolean
  showEdges?: boolean
  hideIfSingle?: boolean
  disabled?: boolean
  ariaLabel?: string
  getTo?: (page: number) => RouteLocationRaw
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  maxVisiblePages: 7,
  showPrevNext: true,
  showEdges: true,
  hideIfSingle: true,
  disabled: false,
  ariaLabel: '',
  getTo: undefined
})

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const NuxtLink = resolveComponent('NuxtLink')
const ariaLabelComputed = computed(() => props.ariaLabel || t('ui.pagination.aria'))

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

const totalPages = computed(() => Math.max(0, Math.floor(props.totalPages)))

const currentPage = computed(() => {
  const v = Math.floor(props.modelValue ?? 1)
  return clamp(v, 1, Math.max(1, totalPages.value))
})

const normalizedMaxVisible = computed(() => {
  const v = Math.floor(props.maxVisiblePages ?? 7)
  return clamp(v, 5, 15)
})

const goToPage = (page: number) => {
  if (props.disabled) return
  const next = clamp(Math.floor(page), 1, Math.max(1, totalPages.value))
  if (next === currentPage.value) return
  emit('update:modelValue', next)
  emit('change', next)
}

const handlePageClick = (page: number, event: Event) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  goToPage(page)
}

const makeRange = (start: number, end: number) => {
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

const pageItem = (page: number): PaginationItem => ({ type: 'page', page })
const ellipsisItem: PaginationItem = { type: 'ellipsis' }

const items = computed<PaginationItem[]>(() => {
  const total = totalPages.value
  if (total <= 0) return []
  if (total <= normalizedMaxVisible.value) {
    return makeRange(1, total).map((page) => pageItem(page))
  }

  const maxVisible = normalizedMaxVisible.value

  if (!props.showEdges) {
    const windowSize = Math.max(1, maxVisible)
    const half = Math.floor(windowSize / 2)
    let start = clamp(currentPage.value - half, 1, Math.max(1, total - windowSize + 1))
    const end = Math.min(total, start + windowSize - 1)
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1)
    }
    return makeRange(start, end).map((page) => pageItem(page))
  }

  const windowSize = Math.max(1, maxVisible - 2)
  const half = Math.floor(windowSize / 2)

  let start = clamp(currentPage.value - half, 2, Math.max(2, total - windowSize))
  const end = Math.min(total - 1, start + windowSize - 1)
  if (end - start + 1 < windowSize) {
    start = Math.max(2, end - windowSize + 1)
  }

  const middle = makeRange(start, end)

  const out: PaginationItem[] = [pageItem(1)]
  if (start > 2) out.push(ellipsisItem)
  out.push(...middle.map((page) => pageItem(page)))
  if (end < total - 1) out.push(ellipsisItem)
  out.push(pageItem(total))

  return out
})

const controlStyle = computed(() => ({
  borderRadius: 'var(--border-radius)',
  borderColor: 'var(--border-color)',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-color)'
}))

const pageStyle = (page: number) => {
  if (page === currentPage.value) {
    return {
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--primary-color)',
      backgroundColor: 'var(--primary-color)',
      color: '#fff'
    }
  }
  return {
    borderRadius: 'var(--border-radius)',
    borderColor: 'var(--border-color)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)'
  }
}

const itemKey = (item: PaginationItem) => (item.type === 'ellipsis' ? 'e' : item.page)
</script>

<style scoped>
button:hover:not(:disabled),
a:hover:not([aria-disabled="true"]) {
  background-color: var(--bg-color);
}
</style>

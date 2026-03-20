<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
    <div class="flex items-center gap-2">
      <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <span class="hidden sm:inline-flex items-center gap-1">
        每页
        <select
          :value="pageSize"
          class="border rounded px-1 py-0.5 bg-[var(--card-bg)] text-[var(--text-color)] text-xs"
          :style="{ borderColor: 'var(--border-color)' }"
          @change="onPageSizeChange"
        >
          <option
            v-for="size in pageSizeOptionsComputed"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        条
      </span>
    </div>
    <div class="inline-flex items-center gap-1">
      <button
        type="button"
        class="px-2 py-1 rounded border text-xs sm:text-sm disabled:opacity-40"
        :style="{ borderColor: 'var(--border-color)' }"
        :disabled="page <= 1"
        @click="changePage(page - 1)"
      >
        上一页
      </button>
      <button
        v-for="p in pages"
        :key="p"
        type="button"
        class="px-2 py-1 rounded border text-xs sm:text-sm"
        :class="p === page ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]' : 'hover:bg-[var(--primary-color)]/5'"
        :style="p === page ? {} : { borderColor: 'var(--border-color)' }"
        @click="changePage(p)"
      >
        {{ p }}
      </button>
      <button
        type="button"
        class="px-2 py-1 rounded border text-xs sm:text-sm disabled:opacity-40"
        :style="{ borderColor: 'var(--border-color)' }"
        :disabled="page >= totalPages"
        @click="changePage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const totalPages = computed(() => {
  if (!props.total || !props.pageSize) return 1
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const pageSizeOptionsComputed = computed(() => {
  const options = props.pageSizeOptions && props.pageSizeOptions.length > 0 ? props.pageSizeOptions : [10, 20, 50]
  return options.includes(props.pageSize) ? options : [...options, props.pageSize].sort((a, b) => a - b)
})

const pages = computed(() => {
  const maxVisible = 5
  const result: number[] = []
  const tp = totalPages.value
  let start = Math.max(1, props.page - 2)
  const end = Math.min(tp, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i += 1) {
    result.push(i)
  }
  return result
})

const changePage = (p: number) => {
  const tp = totalPages.value
  const next = Math.min(tp, Math.max(1, p))
  if (next !== props.page) {
    emit('update:page', next)
  }
}

const onPageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = Number(target.value) || 10
  if (value !== props.pageSize) {
    emit('update:pageSize', value)
  }
}
</script>

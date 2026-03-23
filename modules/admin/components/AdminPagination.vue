<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
    <div class="flex items-center gap-2">
      <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <span class="hidden sm:inline-flex items-center gap-1">
        每页
        <div class="w-20">
          <BaseSelect
            v-model="pageSizeModel"
            :options="pageSizeSelectOptions"
            size="sm"
            placeholder=""
          />
        </div>
        条
      </span>
    </div>
    <div class="inline-flex items-center gap-1">
      <BaseButton
        size="xs"
        variant="ghost"
        :disabled="page <= 1"
        @click="changePage(page - 1)"
      >
        上一页
      </BaseButton>
      <BaseButton
        v-for="p in pages"
        :key="p"
        size="xs"
        :variant="p === page ? 'primary' : 'outline'"
        @click="changePage(p)"
      >
        {{ p }}
      </BaseButton>
      <BaseButton
        size="xs"
        variant="ghost"
        :disabled="page >= totalPages"
        @click="changePage(page + 1)"
      >
        下一页
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'

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

const pageSizeSelectOptions = computed(() =>
  pageSizeOptionsComputed.value.map(size => ({
    label: String(size),
    value: size
  }))
)

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value: number | string) => {
    const size = Number(value) || 10
    if (size !== props.pageSize) {
      emit('update:pageSize', size)
    }
  }
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

</script>

<template>
  <div class="space-y-3 relative">
    <div class="overflow-x-auto rounded-md border" :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 60%, transparent)' }">
      <table class="min-w-full text-sm">
        <thead
          class="text-left text-[var(--text-secondary)] border-b bg-[var(--muted-bg)]"
          :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 70%, transparent)' }"
        >
          <tr>
            <th
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="[
                'py-2 pr-4 relative select-none',
                colIndex === 0 ? 'pl-4' : ''
              ]"
              :style="{ width: widthStyle(column.key) }"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="inline-flex items-center gap-1"
                @click="toggleSort(column.key)"
              >
                <span>{{ column.label }}</span>
                <span class="text-xs">
                  <span v-if="sortKey === column.key && sortOrder === 'asc'">▲</span>
                  <span v-else-if="sortKey === column.key && sortOrder === 'desc'">▼</span>
                  <span v-else>▽</span>
                </span>
              </button>
              <span v-else>
                {{ column.label }}
              </span>
              <span
                class="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                @mousedown.prevent="startResize($event, column.key)"
              />
            </th>
            <th v-if="$slots.actions" class="py-2 pr-4">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in paginatedRows"
            :key="rowKey(row, rowIndex)"
            :class="[
              'border-b last:border-b-0 transition-colors',
              rowIndex % 2 === 0 ? 'bg-[var(--card-bg)]' : 'bg-[var(--muted-bg)]/40',
              'hover:bg-[var(--primary-color)]/5'
            ]"
            :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 40%, transparent)' }"
            @click="emit('row-click', row)"
          >
            <td
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="[
                'py-2 pr-4 align-middle',
                colIndex === 0 ? 'pl-4' : ''
              ]"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="(row as any)[column.key]"
                :column="column"
                :row-index="rowIndex"
              >
                {{ (row as any)[column.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="py-2 pr-4 align-middle">
              <slot name="actions" :row="row" :row-index="rowIndex" />
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="py-6 text-center text-[var(--text-secondary)]"
            >
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
      <BaseLoading :loading="loading" />
    </div>

    <AdminPagination
      v-if="showPagination"
      :page="page"
      :page-size="pageSizeComputed"
      :total="totalComputed"
      @update:page="updatePage"
      @update:page-size="updatePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BaseLoading from '~/components/ui/BaseLoading.vue'
import AdminPagination from '~/modules/admin/components/AdminPagination.vue'

interface AdminTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: number
}

const props = defineProps<{
  columns: AdminTableColumn[]
  rows: any[]
  pageSize?: number
  loading?: boolean
  total?: number
  serverSide?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:sort', payload: { key: string; order: 'asc' | 'desc' }): void
  (e: 'row-click', row: any): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
}>()

const page = ref(1)
const pageSizeComputed = computed(() => props.pageSize || 10)

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const widths = ref<Record<string, number | undefined>>({})
const resizingKey = ref<string | null>(null)
const startX = ref(0)
const startWidth = ref(0)

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  const key = sortKey.value
  const order = sortOrder.value
  const copy = [...props.rows]
  copy.sort((a, b) => {
    const av = (a as any)[key]
    const bv = (b as any)[key]
    if (av == null && bv == null) return 0
    if (av == null) return order === 'asc' ? -1 : 1
    if (bv == null) return order === 'asc' ? 1 : -1
    if (av < bv) return order === 'asc' ? -1 : 1
    if (av > bv) return order === 'asc' ? 1 : -1
    return 0
  })
  return copy
})

const showPagination = computed(() => props.rows.length > 0)

const totalComputed = computed(() => (typeof props.total === 'number' ? props.total : props.rows.length))

const paginatedRows = computed(() => {
  if (props.serverSide) {
    // 服务端分页模式：父组件只传入当前页的数据，这里不再做 slice
    return sortedRows.value
  }

  const start = (page.value - 1) * pageSizeComputed.value
  return sortedRows.value.slice(start, start + pageSizeComputed.value)
})

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else {
      // 第三次点击：回到默认状态（不排序）
      sortKey.value = null
      sortOrder.value = 'asc'
    }
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }

  if (sortKey.value) {
    emit('update:sort', { key: sortKey.value, order: sortOrder.value })
  }
}

const updatePage = (value: number) => {
  page.value = value
  emit('update:page', value)
}

const updatePageSize = (value: number) => {
  page.value = 1
  emit('update:pageSize', value)
}

const rowKey = (row: any, index: number) => {
  if (row && typeof row === 'object' && '_id' in row) return (row as any)._id as any
  if (row && 'id' in row) return (row as any).id as any
  return index
}

const widthStyle = (key: string) => {
  const w = widths.value[key]
  return w ? `${w}px` : undefined
}

const startResize = (event: MouseEvent, key: string) => {
  const target = event.currentTarget as HTMLElement
  const th = target.parentElement as HTMLElement | null
  if (!th) return
  const rect = th.getBoundingClientRect()
  resizingKey.value = key
  startX.value = event.clientX
  startWidth.value = rect.width
}

const handleMouseMove = (event: MouseEvent) => {
  if (!resizingKey.value) return
  const delta = event.clientX - startX.value
  const next = Math.max(60, startWidth.value + delta)
  widths.value = { ...widths.value, [resizingKey.value]: next }
}

const stopResize = () => {
  if (!resizingKey.value) return
  resizingKey.value = null
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopResize)
})
</script>

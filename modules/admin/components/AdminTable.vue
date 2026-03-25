<template>
  <div class="space-y-3 relative">
    <div class="overflow-x-auto rounded-md border" :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 60%, transparent)' }">
      <table :class="['text-sm w-full', props.compact ? 'min-w-full' : 'min-w-[960px]']">
        <thead
          class="text-left text-[var(--text-secondary)] border-b bg-[var(--card-bg)]"
          :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 70%, transparent)' }"
        >
          <tr>
            <th v-if="selectable" class="py-2 pl-4 pr-2 w-8">
              <input
                type="checkbox"
                class="rounded border-[var(--border-color)]"
                :checked="allSelectedOnPage"
                @click.stop
                @change.stop="toggleSelectAll"
              >
            </th>
            <th
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="[
                'py-2 pr-4 relative select-none',
                colIndex === 0 && !selectable ? 'pl-4' : '',
                column.fixed === 'left' ? 'sticky left-0 z-20 bg-[var(--card-bg)]' : '',
                column.fixed === 'right' ? 'sticky right-0 z-20 bg-[var(--card-bg)]' : '',
                resizingKey === column.key ? 'bg-[var(--primary-color)]/5' : '',
                column.align === 'right'
                  ? 'text-right'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
              ]"
              :style="{
                width: widthStyle(column.key),
                minWidth: column.minWidth ? `${column.minWidth}px` : undefined
              }"
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
                class="absolute right-0 top-0 h-full w-3 cursor-col-resize flex items-stretch justify-center group"
                @mousedown.prevent="startResize($event, column.key)"
              >
                <span
                  class="w-px bg-[var(--border-color)] group-hover:bg-[var(--primary-color)] transition-colors"
                  :class="resizingKey === column.key ? 'bg-[var(--primary-color)]' : ''"
                />
              </span>
            </th>
            <th
              v-if="$slots.actions"
              class="py-2 px-2 w-[120px] sticky right-0 z-30 bg-[var(--card-bg)] text-center whitespace-nowrap"
            >
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
              rowIndex % 2 === 0 ? 'bg-[var(--card-bg)]' : 'bg-[var(--muted-bg)]',
              'hover:bg-[var(--primary-color)]/5'
            ]"
            :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 40%, transparent)' }"
            @click="emit('row-click', row)"
          >
            <td v-if="selectable" class="py-2 pl-4 pr-2 align-middle">
              <input
                type="checkbox"
                class="rounded border-[var(--border-color)]"
                :checked="isRowSelected(row, rowIndex)"
                @click.stop
                @change.stop="toggleRowSelection(row, rowIndex)"
              >
            </td>
            <td
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="[
                'py-2 pr-4 align-middle',
                colIndex === 0 && !selectable ? 'pl-4' : '',
                column.fixed === 'left' ? 'sticky left-0 z-10 bg-[var(--card-bg)]' : '',
                column.fixed === 'right' ? 'sticky right-0 z-10 bg-[var(--card-bg)]' : '',
                column.align === 'right'
                  ? 'text-right'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
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
            <td
              v-if="$slots.actions"
              class="py-2 px-2 w-[120px] align-middle sticky right-0 z-30 bg-[var(--card-bg)] whitespace-nowrap"
            >
              <slot name="actions" :row="row" :row-index="rowIndex" />
            </td>
          </tr>
          <tr v-if="!loading && paginatedRows.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="py-6 text-center text-[var(--text-secondary)]"
            >
              <BaseEmpty title="暂无数据" />
            </td>
          </tr>
        </tbody>
      </table>
      <BaseLoading :loading="loading" />
    </div>

    <div
      v-if="selectable && selectedKeysComputed.length && $slots.selectionActions"
      class="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1"
    >
      <div>
        <slot
          name="selectionActions"
          :selected-keys="selectedKeysComputed"
          :selected-rows="selectedRows"
        />
      </div>
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
import BaseEmpty from '~/components/ui/BaseEmpty.vue'
import AdminPagination from '~/modules/admin/components/AdminPagination.vue'

interface AdminTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  minWidth?: number
}

const props = defineProps<{
  columns: AdminTableColumn[]
  rows: any[]
  pageSize?: number
  loading?: boolean
  total?: number
  serverSide?: boolean
  selectable?: boolean
  selectedKeys?: (string | number)[]
  hidePagination?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:sort', payload: { key: string; order: 'asc' | 'desc' }): void
  (e: 'row-click', row: any): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'update:selectedKeys', keys: (string | number)[]): void
  (e: 'selection-change', payload: { keys: (string | number)[]; rows: any[] }): void
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

const showPagination = computed(() => !props.hidePagination && props.rows.length > 0)

const totalComputed = computed(() => (typeof props.total === 'number' ? props.total : props.rows.length))

const paginatedRows = computed(() => {
  if (props.serverSide) {
    // 服务端分页模式：父组件只传入当前页的数据，这里不再做 slice
    return sortedRows.value
  }

  const start = (page.value - 1) * pageSizeComputed.value
  return sortedRows.value.slice(start, start + pageSizeComputed.value)
})

const selectedKeysComputed = computed<(string | number)[]>(() => props.selectedKeys || [])

const selectedKeySet = computed(() => new Set(selectedKeysComputed.value))

const allSelectedOnPage = computed(() => {
  if (!props.selectable || !paginatedRows.value.length) return false
  return paginatedRows.value.every((row, index) => selectedKeySet.value.has(rowKey(row, index) as any))
})

const selectedRows = computed(() => {
  if (!props.selectable || !selectedKeysComputed.value.length) return []
  const set = new Set(selectedKeysComputed.value)
  return props.rows.filter((row, index) => set.has(rowKey(row, index) as any))
})

const updateSelection = (keys: (string | number)[]) => {
  emit('update:selectedKeys', keys)
  emit('selection-change', { keys, rows: selectedRows.value })
}

const isRowSelected = (row: any, index: number) => {
  if (!props.selectable) return false
  return selectedKeySet.value.has(rowKey(row, index) as any)
}

const toggleRowSelection = (row: any, index: number) => {
  if (!props.selectable) return
  const key = rowKey(row, index) as string | number
  const next = new Set(selectedKeysComputed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  updateSelection(Array.from(next))
}

const toggleSelectAll = () => {
  if (!props.selectable) return
  if (allSelectedOnPage.value) {
    // 取消当前页所有选择
    const pageKeySet = new Set(paginatedRows.value.map((row, index) => rowKey(row, index) as any))
    const next = selectedKeysComputed.value.filter(key => !pageKeySet.has(key))
    updateSelection(next)
  } else {
    // 选中当前页所有行（在原有选择基础上追加）
    const next = new Set(selectedKeysComputed.value)
    paginatedRows.value.forEach((row, index) => {
      next.add(rowKey(row, index) as any)
    })
    updateSelection(Array.from(next))
  }
}

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
  if (w) return `${w}px`
  const column = props.columns.find(col => col.key === key)
  return column?.width ? `${column.width}px` : undefined
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

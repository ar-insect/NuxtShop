<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.order.list.title') }}
      </h1>
    </div>

    <ClientOnly>
      <BaseCard class="p-4 space-y-4">
        <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
              {{ t('admin.order.list.total', { count: totalOrders }) }}
          </p>
          <div v-if="selectedOrderIds.length" class="flex items-center gap-2">
            <span class="text-xs text-[var(--text-secondary)]">
              {{ t('admin.common.selected', { count: selectedOrderIds.length }) }}
            </span>
            <BaseButton
              size="xs"
              variant="outline"
              class="text-red-600 hover:bg-red-50 hover:border-red-200"
              :disabled="listLoading || !selectedOrderIds.length"
              @click="handleBatchDelete"
            >
              {{ t('admin.common.delete') }}
            </BaseButton>
          </div>
        </div>

        <AdminSearchPanel
          :search-label="t('admin.common.search')"
          :reset-label="t('admin.common.reset')"
          @search="applySearch"
          @reset="clearSearch"
        >
          <template #primary>
            <div class="md:w-40">
              <BaseSelect
                v-model="filterStatus"
                :options="statusFilterOptions"
                :placeholder="t('admin.order.list.statusPlaceholder')"
                size="sm"
              />
            </div>
            <div class="md:w-40">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                :placeholder="t('admin.order.list.searchFieldPlaceholder')"
                size="sm"
              />
            </div>
            <div class="flex-1 min-w-[220px]">
              <BaseInput
                class="h-8 w-full"
                v-model="searchKeywordInput"
                clearable
                :placeholder="t('admin.order.list.searchKeywordPlaceholder')"
                @keyup.enter="applySearch"
              />
            </div>
          </template>
        </AdminSearchPanel>
      </div>

      <AdminTable
        v-model:selected-keys="selectedOrderIds"
        selectable
        :columns="columns"
        :rows="filteredOrders"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalOrders"
        server-side
        row-clickable
        @row-click="openDetail"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-id="{ row }">
          <div class="flex flex-col text-xs">
            <span class="font-mono text-[var(--text-color)]">
              {{ row.id }}
            </span>
            <span class="text-[var(--text-secondary)]">
              {{ row.shippingAddress?.name || '-' }} / {{ row.shippingAddress?.phone || '-' }}
            </span>
          </div>
        </template>
        <template #cell-status="{ value }">
          <AdminTag :label="statusLabel(value)" :status="statusColor(value)" size="sm" />
        </template>
        <template #cell-total="{ value }">
          <span class="text-sm text-[var(--text-color)]">
            ￥{{ value.toFixed(2) }}
          </span>
        </template>
        <template #cell-date="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ formatDate(value) }}
          </span>
        </template>
        </AdminTable>
      </BaseCard>

      <BaseModal
        v-model="detailOpen"
        mode="drawer"
        :title="currentOrder
          ? t('admin.order.list.detailTitle', { id: currentOrder.id })
          : t('admin.order.list.detailTitleFallback')"
        :close-on-mask="true"
      >
      <div v-if="currentOrder" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
          <div class="space-y-2 text-sm text-[var(--text-secondary)]">
            <p>
              {{ t('admin.order.list.detailId') }}
              <span class="font-mono text-[var(--text-color)] break-all">{{ currentOrder.id }}</span>
            </p>
            <p>
              {{ t('admin.order.list.detailDate') }}{{ formatDate(currentOrder.date) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-1 text-sm">
            <div class="flex items-center gap-2">
              <AdminTag
                :label="statusLabel(currentOrder.status)"
                :status="statusColor(currentOrder.status)"
                size="sm"
              />
            </div>
            <p class="text-[var(--text-secondary)]">
              {{ t('admin.order.list.detailTotal') }}
              <span class="ml-1 text-base font-semibold text-[var(--text-color)]">
                ￥{{ currentOrder.total.toFixed(2) }}
              </span>
            </p>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 text-sm text-[var(--text-secondary)]">
          <div class="space-y-1">
            <p>
              {{ t('admin.order.list.detailReceiver') }}{{ currentOrder.shippingAddress.name }} / {{ currentOrder.shippingAddress.phone }}
            </p>
          </div>
          <div class="space-y-1 md:text-right">
            <p>
              {{ t('admin.order.list.detailAddress') }}{{ currentOrder.shippingAddress.address }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium text-[var(--text-color)]">
            {{ t('admin.order.list.statusSectionTitle') }}
          </p>
          <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
            <BaseSelect
              v-model="statusEdit"
              :options="statusEditOptions"
              class="w-40"
            />
            <div class="flex justify-end">
              <AdminTag
                :label="statusLabel(currentOrder.status)"
                :status="statusColor(currentOrder.status)"
                size="sm"
              />
            </div>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-[var(--text-color)] mb-2">
            {{ t('admin.order.list.itemsSectionTitle') }}
          </p>
          <AdminTable
            :columns="itemColumns"
            :rows="currentOrder.items"
            :page-size="currentOrder.items.length"
            :hide-pagination="true"
            compact
          >
            <template #cell-title="{ row }">
              <div class="flex items-center gap-2">
                <img
                  v-if="row.image"
                  :src="row.image"
                  alt=""
                  class="w-8 h-8 rounded border border-[var(--border-color)] object-cover"
                >
                <span>{{ row.title }}</span>
              </div>
            </template>
            <template #cell-price="{ value }">
              <span class="text-xs text-[var(--text-color)]">
                ￥{{ value.toFixed(2) }}
              </span>
            </template>
            <template #cell-quantity="{ value }">
              <span class="text-xs text-[var(--text-color)]">
                {{ value }}
              </span>
            </template>
            <template #cell-subtotal="{ row }">
              <span class="text-xs text-[var(--text-color)]">
                ￥{{ (row.price * row.quantity).toFixed(2) }}
              </span>
            </template>
          </AdminTable>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="detailOpen = false">
          {{ t('admin.order.list.close') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!currentOrder || statusEdit === currentOrder.status"
          @click="updateStatus"
        >
          {{ t('admin.order.list.updateStatus') }}
        </BaseButton>
        </template>
      </BaseModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminSearchPanel from '~/modules/admin/components/AdminSearchPanel.vue'
import { useAdminTable } from '~/modules/admin/composables/useAdminTable'
import { http } from '~/utils/http'
import type { OrderDetail, OrderStatus } from '~/types/api'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminOrderListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin',
  ssr: false
})

interface AdminOrder extends OrderDetail {
  userId?: string
  createdAt?: string
  updatedAt?: string
}

const toast = useToast()
const { t } = useI18n()

const itemColumns = [
  { key: 'title', label: '商品' },
  { key: 'price', label: '单价' },
  { key: 'quantity', label: '数量' },
  { key: 'subtotal', label: '小计' }
]

const searchField = ref<'id' | 'name' | 'phone'>('id')
const searchKeyword = ref('')
const searchKeywordInput = ref('')
const filterStatus = ref<'ALL' | OrderStatus>('ALL')

const {
  page,
  pageSize,
  items: orders,
  total: totalOrders,
  listLoading,
  tableLoading,
  reload,
  handlePageChange,
  handlePageSizeChange
} = useAdminTable<AdminOrder>({
  key: 'admin-orders',
  endpoint: '/admin/orders',
  getFilterParams: () => {
    const params: Record<string, string | number> = {}
    if (filterStatus.value !== 'ALL') {
      params.status = filterStatus.value
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.trim()
      const field = searchField.value
      if (field === 'id') {
        params.id = keyword
      } else if (field === 'name') {
        params.name = keyword
      } else {
        params.phone = keyword
      }
    }
    return params
  }
})

const selectedOrderIds = ref<(string | number)[]>([])

const searchFieldOptions = computed(() => [
  { label: t('admin.order.list.searchFieldId'), value: 'id' },
  { label: t('admin.order.list.searchFieldName'), value: 'name' },
  { label: t('admin.order.list.searchFieldPhone'), value: 'phone' }
])

const statusFilterOptions = computed(() => [
  { label: t('admin.order.list.statusAll'), value: 'ALL' },
  { label: t('admin.order.list.statusPending'), value: 'pending' },
  { label: t('admin.order.list.statusProcessing'), value: 'processing' },
  { label: t('admin.order.list.statusShipped'), value: 'shipped' },
  { label: t('admin.order.list.statusDelivered'), value: 'delivered' },
  { label: t('admin.order.list.statusCancelled'), value: 'cancelled' }
])

const filteredOrders = computed(() => {
  const list = orders.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return list
  }

  return list.filter((order) => {
    const field = searchField.value
    let value: string | number | undefined
    if (field === 'id') {
      value = order.id
    } else if (field === 'name') {
      value = order.shippingAddress?.name
    } else {
      value = order.shippingAddress?.phone
    }
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(keyword)
  })
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterStatus.value = 'ALL'
  page.value = 1
  await reload()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  reload()
}

watch(filterStatus, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
})

const formatDate = (value?: string) => {
  if (!value) return ''
  try {
    const iso = String(value)
    // 简单截断为 YYYY-MM-DD HH:mm，避免受时区和本地化影响导致 SSR 与客户端不一致
    return iso.replace('T', ' ').slice(0, 16)
  } catch {
    return value
  }
}

const statusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return t('admin.order.list.statusPending')
    case 'processing':
      return t('admin.order.list.statusProcessing')
    case 'shipped':
      return t('admin.order.list.statusShipped')
    case 'delivered':
      return t('admin.order.list.statusDelivered')
    case 'cancelled':
      return t('admin.order.list.statusCancelled')
    default:
      return status
  }
}

const statusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'processing':
      return 'primary'
    case 'shipped':
      return 'primary'
    case 'delivered':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'muted'
  }
}

const detailOpen = ref(false)
const currentOrder = ref<AdminOrder | null>(null)
const statusEdit = ref<OrderStatus>('pending')

const statusEditOptions = computed(() => [
  { label: t('admin.order.list.statusPending'), value: 'pending' },
  { label: t('admin.order.list.statusProcessing'), value: 'processing' },
  { label: t('admin.order.list.statusShipped'), value: 'shipped' },
  { label: t('admin.order.list.statusDelivered'), value: 'delivered' },
  { label: t('admin.order.list.statusCancelled'), value: 'cancelled' }
])

const openDetail = (row: AdminOrder) => {
  currentOrder.value = row
  statusEdit.value = row.status
  detailOpen.value = true
}

const updateStatus = async () => {
  if (!currentOrder.value) return
  if (statusEdit.value === currentOrder.value.status) return

  try {
    listLoading.value = true
    await http.put(`/admin/orders/${currentOrder.value.id}`, {
      status: statusEdit.value
    })
    toast.success(t('admin.order.list.statusUpdated', { id: currentOrder.value.id }))
    await reload()
    const updated = orders.value.find(o => o.id === currentOrder.value?.id)
    if (updated) {
      currentOrder.value = updated
    }
  } finally {
    listLoading.value = false
  }
}

const columns = computed(() => [
  { key: 'id', label: t('admin.order.list.columnId'), sortable: true, width: 260 },
  { key: 'total', label: t('admin.order.list.columnTotal'), sortable: true, width: 120, align: 'right' as const, minWidth: 120 },
  { key: 'status', label: t('admin.order.list.columnStatus'), sortable: true, width: 120 },
  { key: 'date', label: t('admin.order.list.columnDate'), sortable: true, width: 200 }
])

const handleBatchDelete = async () => {
  if (!selectedOrderIds.value.length || listLoading.value) return
  const ok = await confirm(t('admin.order.list.deleteConfirm', { count: selectedOrderIds.value.length }))
  if (!ok) return

  try {
    listLoading.value = true
    for (const id of selectedOrderIds.value) {
      await http.delete(`/admin/orders/${id}`)
    }
    selectedOrderIds.value = []
    await reload()
    toast.success(t('admin.order.list.deleteBatchSuccess'))
  } finally {
    listLoading.value = false
  }
}
</script>

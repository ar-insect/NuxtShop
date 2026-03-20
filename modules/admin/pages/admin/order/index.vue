<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        订单管理
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            共 {{ totalOrders }} 个订单
          </p>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">
            <div class="md:col-span-1">
              <BaseSelect
                v-model="filterStatus"
                :options="statusFilterOptions"
                placeholder="全部状态"
              />
            </div>
            <div class="md:col-span-1">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                placeholder="搜索字段"
              />
            </div>
            <div class="md:col-span-3">
              <BaseInput
                v-model="searchKeywordInput"
                placeholder="请输入搜索关键字"
                @keyup.enter="applySearch"
              />
            </div>
            <div class="flex gap-2 justify-end md:col-span-1">
              <BaseButton size="sm" variant="primary" @click="applySearch">
                搜索
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="clearSearch">
                重置
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredOrders"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalOrders"
        server-side
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      >
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
        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton size="xs" variant="outline" @click.stop="openDetail(row)">
              查看详情
            </BaseButton>
          </div>
        </template>
      </AdminTable>
    </BaseCard>

    <BaseModal
      v-model="detailOpen"
      :title="currentOrder ? `订单详情：${currentOrder.id}` : '订单详情'"
      :close-on-mask="true"
      draggable
      enable-fullscreen
    >
      <div v-if="currentOrder" class="space-y-4">
        <div class="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
          <p>
            订单号：<span class="font-mono text-[var(--text-color)]">{{ currentOrder.id }}</span>
          </p>
          <p>
            下单时间：{{ formatDate(currentOrder.date) }}
          </p>
          <p>
            收货人：{{ currentOrder.shippingAddress.name }} / {{ currentOrder.shippingAddress.phone }}
          </p>
          <p>
            收货地址：{{ currentOrder.shippingAddress.address }}
          </p>
          <p>
            订单金额：￥{{ currentOrder.total.toFixed(2) }}
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium text-[var(--text-color)]">
            订单状态
          </p>
          <div class="flex items-center gap-3">
            <BaseSelect
              v-model="statusEdit"
              :options="statusEditOptions"
              class="w-48"
            />
            <AdminTag :label="statusLabel(currentOrder.status)" :status="statusColor(currentOrder.status)" size="sm" />
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-[var(--text-color)] mb-2">
            商品明细
          </p>
          <div class="border rounded-md overflow-hidden">
            <table class="min-w-full text-xs">
              <thead class="bg-[var(--muted-bg)]/60 text-[var(--text-secondary)]">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">商品</th>
                  <th class="px-3 py-2 text-right font-medium">单价</th>
                  <th class="px-3 py-2 text-right font-medium">数量</th>
                  <th class="px-3 py-2 text-right font-medium">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in currentOrder.items"
                  :key="item.id"
                  class="border-t text-[var(--text-color)]"
                  :style="{ borderColor: 'color-mix(in srgb, var(--border-color) 50%, transparent)' }"
                >
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="item.image"
                        :src="item.image"
                        alt=""
                        class="w-8 h-8 rounded border border-[var(--border-color)] object-cover"
                      >
                      <span>{{ item.title }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-right">
                    ￥{{ item.price.toFixed(2) }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    {{ item.quantity }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    ￥{{ (item.price * item.quantity).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="detailOpen = false">
          关闭
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!currentOrder || statusEdit === currentOrder.status"
          @click="updateStatus"
        >
          更新状态
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import { http } from '~/utils/http'
import type { OrderDetail, OrderStatus } from '~/types/api'
import { useToast } from '~/composables/useToast'

definePageMeta({
  name: 'AdminOrderListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

interface AdminOrder extends OrderDetail {
  userId?: string
  createdAt?: string
  updatedAt?: string
}

const toast = useToast()

const page = ref(1)
const pageSize = ref(10)
const filterStatus = ref<'ALL' | OrderStatus>('ALL')

const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  if (filterStatus.value !== 'ALL') {
    params.status = filterStatus.value
  }
  params.page = page.value
  params.limit = pageSize.value
  return params
}

const { data, pending } = await useAsyncData(
  'admin-orders',
  () =>
    http.get<{ code: number; message: string; data: { items: AdminOrder[]; total: number } }>(
      '/admin/orders',
      buildFilterParams()
    ),
  { server: false }
)

const orders = computed<AdminOrder[]>(() => data.value?.data.items || [])
const totalOrders = computed(() => data.value?.data.total || 0)

const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchField = ref<'id' | 'name' | 'phone'>('id')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = [
  { label: '订单号', value: 'id' },
  { label: '收货人', value: 'name' },
  { label: '手机号', value: 'phone' }
]

const statusFilterOptions = [
  { label: '全部状态', value: 'ALL' },
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已发货', value: 'shipped' },
  { label: '已送达', value: 'delivered' },
  { label: '已取消', value: 'cancelled' }
]

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
  await reloadOrders()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
}

const reloadOrders = async () => {
  const res = await http.get<{ code: number; message: string; data: { items: AdminOrder[]; total: number } }>(
    '/admin/orders',
    buildFilterParams()
  )
  ;(data.value as any) = res
}

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reloadOrders()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reloadOrders()
  } finally {
    listLoading.value = false
  }
}

watch(filterStatus, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reloadOrders()
  } finally {
    listLoading.value = false
  }
})

const formatDate = (value?: string) => {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleString()
  } catch {
    return value
  }
}

const statusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'processing':
      return '处理中'
    case 'shipped':
      return '已发货'
    case 'delivered':
      return '已送达'
    case 'cancelled':
      return '已取消'
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

const statusEditOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已发货', value: 'shipped' },
  { label: '已送达', value: 'delivered' },
  { label: '已取消', value: 'cancelled' }
]

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
    toast.success(`订单状态已更新：${currentOrder.value.id}`)
    await reloadOrders()
    const updated = orders.value.find(o => o.id === currentOrder.value?.id)
    if (updated) {
      currentOrder.value = updated
    }
  } finally {
    listLoading.value = false
  }
}

const columns = [
  { key: 'id', label: '订单号', sortable: true, width: 200 },
  { key: 'total', label: '金额', sortable: true, width: 120 },
  { key: 'status', label: '状态', sortable: true, width: 120 },
  { key: 'date', label: '下单时间', sortable: true, width: 200 }
]
</script>

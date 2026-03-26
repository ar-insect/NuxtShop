<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.marketing.coupon.title') }}
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-[var(--text-secondary)]">
          {{ t('admin.marketing.coupon.total', { count: total }) }}
        </p>
        <div class="flex items-center gap-2">
          <BaseButton size="sm" variant="primary" @click="openCreate">
            {{ t('admin.marketing.coupon.createButton') }}
          </BaseButton>
          <div v-if="selectedCouponIds.length" class="flex items-center gap-2">
            <span class="text-xs text-[var(--text-secondary)]">
              {{ t('admin.common.selected', { count: selectedCouponIds.length }) }}
            </span>
            <BaseTooltip
              :text="tableLoading ? t('admin.marketing.coupon.deleteDisabledLoadingHint') : ''"
            >
              <BaseButton
                size="xs"
                variant="outline"
                class="text-red-600 hover:bg-red-50 hover:border-red-200"
                :disabled="tableLoading || !selectedCouponIds.length"
                @click="handleBatchDelete"
              >
                {{ t('admin.common.delete') }}
              </BaseButton>
            </BaseTooltip>
          </div>
        </div>
      </div>

      <AdminSearchPanel
        :search-label="t('admin.marketing.coupon.search')"
        :reset-label="t('admin.marketing.coupon.reset')"
        @search="applySearch"
        @reset="clearSearch"
      >
        <template #primary>
          <div class="md:w-40">
            <BaseSelect
              v-model="enabledFilter"
              :options="enabledOptions"
              :placeholder="t('admin.marketing.coupon.statusPlaceholder')"
              size="sm"
            />
          </div>
          <div class="flex-1 min-w-[220px]">
            <BaseInput
              class="h-8 w-full"
              v-model="searchKeywordInput"
              clearable
              :placeholder="t('admin.marketing.coupon.searchPlaceholder')"
              @keyup.enter="applySearch"
            />
          </div>
        </template>
      </AdminSearchPanel>

      <AdminTable
        v-model:selected-keys="selectedCouponIds"
        selectable
        :columns="columns"
        :rows="items"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="total"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-name="{ value }">
          <span class="block max-w-[320px] truncate" :title="value">
            {{ value }}
          </span>
        </template>
        <template #cell-type="{ value }">
          <AdminTag
            :label="value === 'fixed' ? t('admin.marketing.coupon.typeFixed') : t('admin.marketing.coupon.typePercent')"
            :status="value === 'fixed' ? 'primary' : 'muted'"
            size="sm"
          />
        </template>
        <template #cell-amount="{ row }">
          <span class="text-xs text-[var(--text-color)]">
            <template v-if="row.type === 'fixed'">
              ¥{{ row.amount.toFixed(2) }}
            </template>
            <template v-else>
              {{ row.amount }}%
            </template>
          </span>
        </template>
        <template #cell-enabled="{ value }">
          <AdminTag
            :label="value ? t('admin.marketing.coupon.statusEnabled') : t('admin.marketing.coupon.statusDisabled')"
            :status="value ? 'success' : 'danger'"
            size="sm"
          />
        </template>
        <template #cell-startAt="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ formatDate(value) }}
          </span>
        </template>
        <template #cell-endAt="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ formatDate(value) }}
          </span>
        </template>
        <template #actions="{ row }">
          <AdminRowActions>
            <BaseButton size="xs" variant="outline" class="px-2" @click.stop="openEdit(row)">
              {{ t('admin.common.edit') }}
            </BaseButton>
            <BaseButton
              size="xs"
              variant="outline"
              class="px-2 text-red-600 hover:bg-red-50 hover:border-red-200"
              @click.stop="handleDelete(row)"
            >
              {{ t('admin.common.delete') }}
            </BaseButton>
          </AdminRowActions>
        </template>
      </AdminTable>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="editing ? t('admin.marketing.coupon.modalTitleEdit') : t('admin.marketing.coupon.modalTitleCreate')"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.code"
          required
          :label="t('admin.marketing.coupon.fieldCode')"
          :placeholder="t('admin.marketing.coupon.fieldCodePlaceholder')"
          :disabled="!!editing"
        />
        <AdminFormField
          v-model="form.name"
          required
          :label="t('admin.marketing.coupon.fieldName')"
          :placeholder="t('admin.marketing.coupon.fieldNamePlaceholder')"
        />
        <AdminFormField
          v-model="form.type"
          required
          :label="t('admin.marketing.coupon.fieldType')"
          component="select"
          :options="typeOptions"
        />
        <AdminFormField
          v-model.number="form.amount"
          required
          component="number"
          :label="t('admin.marketing.coupon.fieldAmount')"
          :placeholder="t('admin.marketing.coupon.fieldAmountPlaceholder')"
        />
        <AdminFormField
          v-model.number="form.minOrderAmount"
          component="number"
          :label="t('admin.marketing.coupon.fieldMinAmount')"
          :placeholder="t('admin.marketing.coupon.fieldMinAmountPlaceholder')"
        />
        <AdminFormField
          v-model="form.startAt"
          type="datetime-local"
          :label="t('admin.marketing.coupon.fieldStartAt')"
          :hint="t('admin.marketing.coupon.fieldStartHint')"
        />
        <AdminFormField
          v-model="form.endAt"
          type="datetime-local"
          :label="t('admin.marketing.coupon.fieldEndAt')"
          :hint="t('admin.marketing.coupon.fieldEndHint')"
        />
        <div class="flex items-center gap-2 md:col-span-2">
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="form.enabled" type="checkbox" class="rounded border-[var(--border-color)]">
            {{ t('admin.marketing.coupon.fieldEnabled') }}
          </label>
        </div>
      </form>
      <template #footer>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="listLoading"
          @click="modalOpen = false"
        >
          {{ t('admin.marketing.coupon.modalCancel') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="listLoading"
          :disabled="listLoading"
          @click="handleSubmit"
        >
          {{ editing ? t('admin.marketing.coupon.modalSubmitEdit') : t('admin.marketing.coupon.modalSubmitCreate') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminRowActions from '~/modules/admin/components/AdminRowActions.vue'
import AdminSearchPanel from '~/modules/admin/components/AdminSearchPanel.vue'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import { useAdminTable } from '~/modules/admin/composables/useAdminTable'
import { http } from '~/utils/http'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminCouponPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

type CouponType = 'fixed' | 'percent'

interface AdminCoupon {
  id: string
  code: string
  name: string
  type: CouponType
  amount: number
  minOrderAmount: number
  startAt: string | null
  endAt: string | null
  enabled: boolean
  createdAt?: string
}

const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const searchKeyword = ref('')
const searchKeywordInput = ref('')
const enabledFilter = ref<'ALL' | 'ENABLED' | 'DISABLED'>('ALL')

const enabledOptions = computed(() => [
  { label: t('admin.marketing.coupon.enabledAll'), value: 'ALL' },
  { label: t('admin.marketing.coupon.enabledYes'), value: 'ENABLED' },
  { label: t('admin.marketing.coupon.enabledNo'), value: 'DISABLED' }
])

const typeOptions = computed(() => [
  { label: t('admin.marketing.coupon.typeFixed'), value: 'fixed' },
  { label: t('admin.marketing.coupon.typePercent'), value: 'percent' }
])

const {
  page,
  pageSize,
  items,
  total,
  listLoading,
  tableLoading,
  reload,
  handlePageChange,
  handlePageSizeChange
} = useAdminTable<AdminCoupon>({
  key: 'admin-coupons',
  endpoint: '/admin/coupons',
  getFilterParams: () => {
    const params: Record<string, string | number> = {
      page: page.value,
      limit: pageSize.value
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    if (enabledFilter.value === 'ENABLED') {
      params.enabled = 'true'
    } else if (enabledFilter.value === 'DISABLED') {
      params.enabled = 'false'
    }

    return params
  }
})

const selectedCouponIds = ref<(string | number)[]>([])

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  enabledFilter.value = 'ALL'
  page.value = 1
  await reload()
}

const applySearch = async () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  await reload()
}

const modalOpen = ref(false)
const editing = ref<AdminCoupon | null>(null)

const form = reactive({
  code: '',
  name: '',
  type: 'fixed' as CouponType,
  amount: 0,
  minOrderAmount: 0,
  startAt: '',
  endAt: '',
  enabled: true
})

const openCreate = () => {
  editing.value = null
  form.code = ''
  form.name = ''
  form.type = 'fixed'
  form.amount = 0
  form.minOrderAmount = 0
  form.startAt = ''
  form.endAt = ''
  form.enabled = true
  modalOpen.value = true
}

const openEdit = (row: AdminCoupon) => {
  editing.value = row
  form.code = row.code
  form.name = row.name
  form.type = row.type
  form.amount = row.amount
  form.minOrderAmount = row.minOrderAmount
  form.startAt = row.startAt || ''
  form.endAt = row.endAt || ''
  form.enabled = row.enabled
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (listLoading.value) return
  if (!form.code || !form.name) {
    toast.error(t('admin.marketing.coupon.errorRequired'))
    return
  }
  if (!form.amount || form.amount <= 0) {
    toast.error(t('admin.marketing.coupon.errorAmountInvalid'))
    return
  }
  if (form.type === 'percent' && form.amount > 100) {
    toast.error(t('admin.marketing.coupon.errorPercentTooLarge'))
    return
  }
  if (form.minOrderAmount < 0) {
    toast.error(t('admin.marketing.coupon.errorMinNegative'))
    return
  }

  if (form.startAt && form.endAt) {
    const start = new Date(form.startAt).getTime()
    const end = new Date(form.endAt).getTime()
    if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
      toast.error(t('admin.marketing.coupon.errorTimeRange'))
      return
    }
  }

  const payload: any = {
    code: form.code,
    name: form.name,
    type: form.type,
    amount: form.amount,
    minOrderAmount: form.minOrderAmount,
    startAt: form.startAt || null,
    endAt: form.endAt || null,
    enabled: form.enabled
  }

  try {
    listLoading.value = true
    if (!editing.value) {
      await http.post('/admin/coupons', payload)
      toast.success(t('admin.marketing.coupon.createSuccess'))
    } else {
      await http.put(`/admin/coupons/${editing.value.id}`, payload)
      toast.success(t('admin.marketing.coupon.updateSuccess'))
    }
    modalOpen.value = false
    await reload()
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminCoupon) => {
  if (listLoading.value) return
  const ok = await confirm(t('admin.marketing.coupon.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/coupons/${row.id}`)
    toast.success(t('admin.marketing.coupon.deleteSuccess'))
    await reload()
  } finally {
    listLoading.value = false
  }
}

const handleBatchDelete = async () => {
  if (!selectedCouponIds.value.length || listLoading.value) return
  const ok = await confirm(t('admin.marketing.coupon.deleteBatchConfirm', { count: selectedCouponIds.value.length }))
  if (!ok) return

  try {
    listLoading.value = true
    for (const id of selectedCouponIds.value) {
      await http.delete(`/admin/coupons/${id}`)
    }
    selectedCouponIds.value = []
    await reload()
    toast.success(t('admin.marketing.coupon.deleteBatchSuccess'))
  } finally {
    listLoading.value = false
  }
}

const { formatDateTime } = useLocaleFormatter()

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return t('admin.marketing.coupon.noLimit')
  return formatDateTime(dateStr)
}

const columns = computed(() => [
  { key: 'code', label: t('admin.marketing.coupon.columnCode'), sortable: true, width: 140 },
  { key: 'name', label: t('admin.marketing.coupon.columnName'), sortable: true, width: 360 },
  { key: 'type', label: t('admin.marketing.coupon.columnType'), sortable: true, width: 110 },
  { key: 'amount', label: t('admin.marketing.coupon.columnAmount'), sortable: true, width: 110, align: 'right' as const, minWidth: 110 },
  { key: 'minOrderAmount', label: t('admin.marketing.coupon.columnMinOrderAmount'), sortable: true, width: 130, align: 'right' as const, minWidth: 120 },
  { key: 'startAt', label: t('admin.marketing.coupon.columnStartAt'), sortable: true, width: 150 },
  { key: 'endAt', label: t('admin.marketing.coupon.columnEndAt'), sortable: true, width: 150 },
  { key: 'enabled', label: t('admin.marketing.coupon.columnEnabled'), sortable: true, width: 80 }
])
</script>

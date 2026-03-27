<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      {{ t('admin.goods.category.title') }}
    </h1>

    <BaseCard class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-[var(--text-secondary)]">
          {{ t('admin.goods.category.total', { count: total }) }}
        </p>
        <BaseButton size="sm" variant="primary" @click="openCreate">
          {{ t('admin.goods.category.createButton') }}
        </BaseButton>
      </div>

      <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-4 items-end">
          <div class="md:col-span-1">
            <BaseSelect
              v-model="statusFilter"
              :options="statusOptions"
              :placeholder="t('admin.goods.category.statusPlaceholder')"
              size="sm"
            />
          </div>
          <div class="md:col-span-2">
            <BaseInput
              v-model="searchKeywordInput"
              class="h-8"
              clearable
              :placeholder="t('admin.goods.category.searchPlaceholder')"
              @keyup.enter="applySearch"
            />
          </div>
          <div class="flex gap-2 justify-end md:col-span-1">
            <BaseButton size="sm" variant="primary" @click="applySearch">
              {{ t('admin.goods.category.search') }}
            </BaseButton>
            <BaseButton size="sm" variant="secondary" @click="clearSearch">
              {{ t('admin.goods.category.reset') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredItems"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="total"
        server-side
        compact
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-key="{ value }">
          <span class="font-mono text-xs text-[var(--text-secondary)]">
            {{ value }}
          </span>
        </template>
        <template #cell-active="{ value }">
          <AdminTag
            :label="value ? t('admin.goods.category.tagEnabled') : t('admin.goods.category.tagDisabled')"
            :status="value ? 'success' : 'danger'"
            size="sm"
          />
        </template>
        <template #cell-order="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ value }}
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
      :title="editing ? t('admin.goods.category.modalTitleEdit') : t('admin.goods.category.modalTitleCreate')"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.key"
          required
          class="md:col-span-2"
          :label="t('admin.goods.category.fieldKey')"
          :placeholder="t('admin.goods.category.fieldKeyPlaceholder')"
          :disabled="true"
          :hint="t('admin.goods.category.fieldKeyHint')"
        />
        <AdminFormField
          v-model="form.label"
          required
          class="md:col-span-2"
          :label="t('admin.goods.category.fieldLabel')"
          :placeholder="t('admin.goods.category.fieldLabelPlaceholder')"
        />
        <AdminFormField
          v-model.number="form.order"
          component="number"
          :label="t('admin.goods.category.fieldOrder')"
          :placeholder="t('admin.goods.category.fieldOrderPlaceholder')"
        />
        <div class="flex items-center gap-2 md:col-span-2">
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="form.active" type="checkbox" class="rounded border-[var(--border-color)]" >
            {{ t('admin.goods.category.fieldActive') }}
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
          {{ t('admin.goods.category.modalCancel') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="listLoading"
          :disabled="listLoading"
          @click="handleSubmit"
        >
          {{ editing ? t('admin.goods.category.modalSubmitEdit') : t('admin.goods.category.modalSubmitCreate') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import AdminRowActions from '~/modules/admin/components/AdminRowActions.vue'
import { http } from '~/utils/http'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminGoodsCategoryPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

interface AdminCategory {
  _id: string
  key: string
  label: string
  parentKey?: string
  order: number
  active: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const statusOptions = computed(() => [
  { label: t('admin.goods.category.statusAll'), value: 'ALL' },
  { label: t('admin.goods.category.statusActive'), value: 'ACTIVE' },
  { label: t('admin.goods.category.statusInactive'), value: 'INACTIVE' }
])

const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  params.page = page.value
  params.limit = pageSize.value
  if (statusFilter.value === 'ACTIVE') {
    params.status = 'ACTIVE'
  } else if (statusFilter.value === 'INACTIVE') {
    params.status = 'INACTIVE'
  }
  return params
}

const { data, pending } = await useAsyncData(
  'admin-product-categories',
  () => http.get<{ code: number; message: string; data: { items: AdminCategory[]; total: number } }>(
    '/admin/product-categories',
    buildFilterParams()
  ),
  { server: false }
)

const items = computed(() => {
  const raw = data.value as any
  const list: AdminCategory[] = Array.isArray(raw?.data?.items)
    ? raw.data.items
    : Array.isArray(raw?.items)
      ? raw.items
      : []
  return list
})

const filteredItems = computed(() => {
  const list = items.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return list
  }
  return list.filter((item) => {
    const key = item.key?.toLowerCase() || ''
    const label = item.label?.toLowerCase() || ''
    return key.includes(keyword) || label.includes(keyword)
  })
})

const total = computed(() => {
  const raw = data.value as any
  const totalValue =
    typeof raw?.data?.total === 'number'
      ? raw.data.total
      : typeof raw?.total === 'number'
        ? raw.total
        : 0
  return totalValue
})

const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const reload = async () => {
  const res = await http.get<{ code: number; message: string; data: { items: AdminCategory[]; total: number } }>(
    '/admin/product-categories',
    buildFilterParams()
  )
  ;(data.value as any) = res
}

onMounted(async () => {
  if (!items.value.length && !pending.value) {
    try {
      listLoading.value = true
      await reload()
    } finally {
      listLoading.value = false
    }
  }
})

watch(statusFilter, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
})

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
}

const modalOpen = ref(false)
const editing = ref<AdminCategory | null>(null)

const form = reactive({
  key: '',
  label: '',
  order: 0,
  active: true
})

const openCreate = () => {
  editing.value = null
  form.key = ''
  form.label = ''
  form.order = 0
  form.active = true
  modalOpen.value = true
}

const openEdit = (row: AdminCategory) => {
  editing.value = row
  form.key = row.key
  form.label = row.label
  form.order = row.order
  form.active = row.active
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!form.key || !form.label) {
    toast.error(t('admin.goods.category.errorRequired'))
    return
  }

  const payload = {
    key: form.key,
    label: form.label,
    order: form.order,
    active: form.active
  }

  try {
    listLoading.value = true
    try {
      if (!editing.value) {
        await http.post('/admin/product-categories', payload)
        toast.success(t('admin.goods.category.createSuccess'))
      } else {
        await http.put(`/admin/product-categories/${editing.value._id}`, {
          label: payload.label,
          order: payload.order,
          active: payload.active
        })
        toast.success(t('admin.goods.category.updateSuccess'))
      }
      modalOpen.value = false
      await reload()
    } catch (error: any) {
      const code = error?.data?.code || error?.code
      if (code === 'PRODUCT_CATEGORY_KEY_EXISTS') {
        toast.error(t('admin.goods.category.errorKeyExists'))
      } else {
        throw error
      }
    }
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminCategory) => {
  const ok = await confirm(t('admin.goods.category.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/product-categories/${row._id}`)
    toast.success(t('admin.goods.category.deleteSuccess'))
    await reload()
  } finally {
    listLoading.value = false
  }
}

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  statusFilter.value = 'ALL'
  page.value = 1
  await reload()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
}

const columns = computed(() => [
  { key: 'key', label: t('admin.goods.category.columnKey'), sortable: true, width: 180 },
  { key: 'label', label: t('admin.goods.category.columnLabel'), sortable: true, width: 280 },
  { key: 'order', label: t('admin.goods.category.columnOrder'), sortable: true, width: 80, align: 'right' as const, minWidth: 80 },
  { key: 'active', label: t('admin.goods.category.columnStatus'), sortable: true, width: 100 }
])

const generateCategoryKey = (label: string) => {
  const base = (label || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  if (base) {
    return base
  }

  return `category-${Date.now()}`
}

watch(
  () => form.label,
  (val) => {
    if (editing.value) return
    form.key = generateCategoryKey(val)
  }
)
</script>

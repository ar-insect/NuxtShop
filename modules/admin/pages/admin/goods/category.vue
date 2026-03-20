<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      商品分类管理
    </h1>

    <BaseCard class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-[var(--text-secondary)]">
          共 {{ total }} 个分类
        </p>
        <BaseButton size="sm" variant="primary" @click="openCreate">
          新增分类
        </BaseButton>
      </div>

      <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-4 items-end">
          <div class="md:col-span-2">
            <BaseInput
              v-model="searchKeywordInput"
              placeholder="请输入分类名称或 Key"
              @keyup.enter="applySearch"
            />
          </div>
          <div class="md:col-span-1">
            <BaseSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="全部状态"
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

      <AdminTable
        :columns="columns"
        :rows="filteredItems"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="total"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-key="{ value }">
          <span class="font-mono text-xs text-[var(--text-secondary)]">
            {{ value }}
          </span>
        </template>
        <template #cell-active="{ value }">
          <AdminTag :label="value ? '启用' : '停用'" :status="value ? 'success' : 'muted'" size="sm" />
        </template>
        <template #cell-order="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ value }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton size="xs" variant="outline" @click.stop="openEdit(row)">
              编辑
            </BaseButton>
            <BaseButton
              size="xs"
              variant="outline"
              class="text-red-600 hover:bg-red-50 hover:border-red-200"
              @click.stop="handleDelete(row)"
            >
              删除
            </BaseButton>
          </div>
        </template>
      </AdminTable>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="editing ? '编辑分类' : '新增分类'"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.key"
          required
          class="md:col-span-2"
          label="分类 Key"
          placeholder="系统自动生成"
          :disabled="true"
          hint="系统根据分类名称自动生成，仅作为内部标识使用"
        />
        <AdminFormField
          v-model="form.label"
          required
          class="md:col-span-2"
          label="分类名称"
          placeholder="例如: 电子产品"
        />
        <AdminFormField
          v-model.number="form.order"
          type="number"
          label="排序"
          placeholder="数值越小越靠前"
        />
        <div class="flex items-center gap-2 md:col-span-2">
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="form.active" type="checkbox" class="rounded border-[var(--border-color)]" >
            启用
          </label>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="modalOpen = false">
          取消
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleSubmit">
          {{ editing ? '保存修改' : '创建分类' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import { http } from '~/utils/http'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'

definePageMeta({
  name: 'AdminGoodsCategoryPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const toast = useToast()
const { confirm } = useConfirm()

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

const statusOptions = [
  { label: '全部状态', value: 'ALL' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' }
]

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
    toast.error('请填写必填字段')
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
        toast.success('分类已创建')
      } else {
        await http.put(`/admin/product-categories/${editing.value._id}`, {
          label: payload.label,
          order: payload.order,
          active: payload.active
        })
        toast.success('分类已更新')
      }
      modalOpen.value = false
      await reload()
    } catch (error: any) {
      const code = error?.data?.code || error?.code
      if (code === 'PRODUCT_CATEGORY_KEY_EXISTS') {
        toast.error('分类 Key 已存在，请修改分类名称')
      } else {
        throw error
      }
    }
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminCategory) => {
  const ok = await confirm('确定要删除该分类吗？')
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/product-categories/${row._id}`)
    toast.success('分类已删除')
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

const columns = [
  { key: 'key', label: 'Key', sortable: true, width: 160 },
  { key: 'label', label: '名称', sortable: true, width: 200 },
  { key: 'order', label: '排序', sortable: true, width: 80 },
  { key: 'active', label: '状态', sortable: true, width: 80 }
]

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

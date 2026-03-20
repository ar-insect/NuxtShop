<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        广告管理
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            共 {{ totalAds }} 条广告
          </p>
          <BaseButton size="sm" variant="primary" @click="openCreate">
            新增广告
          </BaseButton>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">
            <div class="md:col-span-1">
              <BaseSelect
                v-model="filterPosition"
                :options="positionFilterOptions"
                placeholder="全部位置"
              />
            </div>
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
            <div class="md:col-span-2">
              <BaseInput
                v-model="searchKeywordInput"
                placeholder="请输入搜索关键字"
                @keyup.enter="applySearch"
              />
            </div>
            <div class="flex gap-2 justify-end md:col-span-1">
              <BaseButton
                size="sm"
                variant="primary"
                @click="applySearch"
              >
                搜索
              </BaseButton>
              <BaseButton
                size="sm"
                variant="secondary"
                @click="clearSearch"
              >
                重置
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredAds"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalAds"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-position="{ value }">
          <AdminTag :label="value" status="primary" size="sm" />
        </template>
        <template #cell-active="{ value }">
          <AdminTag :label="value !== false ? '启用' : '停用'" :status="value !== false ? 'success' : 'muted'" size="sm" />
        </template>
        <template #cell-media="{ row }">
          <a
            :href="row.link || row.image"
            target="_blank"
            rel="noreferrer"
            class="inline-flex flex-col gap-1 text-[var(--primary-color)] hover:underline break-all"
          >
            <img
              :src="row.image"
              alt=""
              class="w-32 h-16 object-cover rounded"
            >
          </a>
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
              :disabled="row.active !== false"
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
      :title="editing ? '编辑广告' : '新增广告'"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.position"
          required
          component="select"
          :options="positionOptions"
          label="位置"
          placeholder="请选择广告位置"
          class="md:col-span-2"
        />
        <AdminFormField
          v-model.number="form.order"
          required
          type="number"
          label="排序"
          placeholder="1"
        />
        <AdminFormField
          v-model="form.image"
          class="md:col-span-2"
          :rules="[
            { type: 'url', message: '请输入合法的图片地址' }
          ]"
          required
          label="图片地址"
          placeholder="https://..."
        />
        <AdminFormField
          v-model="form.link"
          class="md:col-span-2"
          :rules="[{ type: 'url', message: '请输入合法的链接地址' }]"
          label="跳转链接"
          placeholder="/products?category=electronics"
        />
        <AdminFormField
          v-model="form.altKey"
          class="md:col-span-2"
          required
          label="文案"
          placeholder="pages.home.adElectronics"
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
          {{ editing ? '保存修改' : '创建广告' }}
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
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { http, type ApiResponse } from '~/utils/http'
import { watch } from 'vue'
definePageMeta({
  name: 'AdminAdsPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

interface AdminAd {
  id: number
  position: string
  order: number
  active?: boolean
  image: string
  link: string
  altKey: string
}

const toast = useToast()
const { confirm } = useConfirm()
const modalOpen = ref(false)

const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchField = ref<'altKey' | 'id'>('altKey')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = [
  { label: '文案', value: 'altKey' },
  { label: 'ID', value: 'id' }
]

const filterPosition = ref<'ALL' | 'home' | 'wishlist'>('ALL')
const filterStatus = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

const positionFilterOptions = [
  { label: '全部位置', value: 'ALL' },
  { label: '首页轮播（home）', value: 'home' },
  { label: '收藏页轮播（wishlist）', value: 'wishlist' }
]

const statusFilterOptions = [
  { label: '全部状态', value: 'ALL' },
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' }
]

const page = ref(1)
const pageSize = ref(10)

const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  if (filterPosition.value !== 'ALL') {
    params.position = filterPosition.value
  }
  if (filterStatus.value === 'ACTIVE') {
    params.status = 'ACTIVE'
  } else if (filterStatus.value === 'INACTIVE') {
    params.status = 'INACTIVE'
  }
  return params
}

const { data, pending } = await useAsyncData(
  'admin-ads',
  () =>
    http.get<ApiResponse<{ items: AdminAd[]; total: number }>>('/admin/ads', {
      ...buildFilterParams(),
      page: page.value,
      limit: pageSize.value
    }),
  { server: false }
)

const ads = computed(() => data.value?.data.items || [])
const totalAds = computed(() => data.value?.data.total || 0)

const filteredAds = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return ads.value
  }

  return ads.value.filter((ad) => {
    const field = searchField.value
    const value = (ad as any)[field]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(keyword)
  })
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterPosition.value = 'ALL'
  filterStatus.value = 'ALL'
  page.value = 1
  await reloadAds()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
}

const positionOptions = [
  { label: '首页轮播（home）', value: 'home' },
  { label: '收藏页轮播（wishlist）', value: 'wishlist' }
]

const form = reactive<{
  id?: number
  position: string
  order: number
  active: boolean
  image: string
  link: string
  altKey: string
}>({
  id: undefined,
  position: 'home',
  order: 1,
  active: true,
  image: '',
  link: '',
  altKey: ''
})

const editing = ref<AdminAd | null>(null)

const resetForm = () => {
  if (editing.value) {
    form.id = editing.value.id
    form.position = editing.value.position
    form.order = editing.value.order
    form.active = editing.value.active !== false
    form.image = editing.value.image
    form.link = editing.value.link
    form.altKey = editing.value.altKey
  } else {
    form.id = undefined
    form.position = 'home'
    form.order = (ads.value[ads.value.length - 1]?.order || 0) + 1
    form.active = true
    form.image = ''
    form.link = ''
    form.altKey = ''
  }
}

const reloadAds = async () => {
  const params = buildFilterParams()
  const res = await http.get<ApiResponse<{ items: AdminAd[]; total: number }>>('/admin/ads', {
    ...params,
    page: page.value,
    limit: pageSize.value
  })
  ;(data.value as any) = res
}

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reloadAds()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reloadAds()
  } finally {
    listLoading.value = false
  }
}

const openCreate = () => {
  editing.value = null
  resetForm()
  modalOpen.value = true
}

const openEdit = (row: AdminAd) => {
  editing.value = row
  resetForm()
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!form.position || !form.image || !form.altKey) {
    toast.error('请填写必填字段')
    return
  }

  try {
    listLoading.value = true

    const label = `${form.position} / ${form.altKey}`

    if (editing.value) {
      await http.put<ApiResponse<AdminAd>>(`/admin/ads/${editing.value.id}`, {
        position: form.position,
        order: form.order,
        active: form.active,
        image: form.image,
        link: form.link,
        altKey: form.altKey
      })
      toast.success(`广告已更新：${label}`)
    } else {
      await http.post<ApiResponse<AdminAd>>('/admin/ads', {
        position: form.position,
        order: form.order,
        active: form.active,
        image: form.image,
        link: form.link,
        altKey: form.altKey
      })
      toast.success(`广告已创建：${label}`)
    }

    await reloadAds()
    editing.value = null
    resetForm()
    modalOpen.value = false
  } finally {
    listLoading.value = false
  }
}

watch([filterPosition, filterStatus], async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reloadAds()
  } finally {
    listLoading.value = false
  }
})

const handleDelete = async (row: AdminAd) => {
  if (!row.id || typeof row.id !== 'number') {
    toast.error('广告 ID 无效，无法删除（缺少 id 字段）')
    return
  }

  if (row.active !== false) {
    toast.error('启用中的广告不可删除，请先停用')
    return
  }

  const ok = await confirm('确定要删除这条广告吗？')
  if (!ok) return

  try {
    listLoading.value = true

    await http.delete<ApiResponse<null>>(`/admin/ads/${row.id}`)
    toast.success(`广告已删除：${row.position} / ${row.altKey}`)
    await reloadAds()
    if (editing.value && editing.value.id === row.id) {
      editing.value = null
      resetForm()
    }
  } finally {
    listLoading.value = false
  }
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, width: 80 },
  { key: 'position', label: '位置', sortable: true, width: 120 },
  { key: 'order', label: '排序', sortable: true, width: 100 },
  { key: 'active', label: '状态', sortable: true, width: 100 },
  { key: 'media', label: '图片', sortable: false, width: 260 },
  { key: 'altKey', label: '文案', sortable: false }
]
</script>

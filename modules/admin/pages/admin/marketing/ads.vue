<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.marketing.ads.title') }}
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ t('admin.marketing.ads.total', { count: totalAds }) }}
          </p>
          <BaseButton size="sm" variant="primary" @click="openCreate">
            {{ t('admin.marketing.ads.createButton') }}
          </BaseButton>
        </div>

        <AdminSearchPanel
          :search-label="t('admin.marketing.ads.search')"
          :reset-label="t('admin.marketing.ads.reset')"
        >
          <template #primary>
            <div class="md:w-40">
              <BaseSelect
                v-model="filterPosition"
                :options="positionFilterOptions"
                :placeholder="t('admin.marketing.ads.positionPlaceholder')"
                size="sm"
              />
            </div>
            <div class="flex-1">
              <BaseInput
                class="h-8 w-full"
                v-model="searchKeywordInput"
                clearable
                :placeholder="t('admin.marketing.ads.searchKeywordPlaceholder')"
                @keyup.enter="applySearch"
              />
            </div>
          </template>

          <template #more>
            <div class="md:w-40">
              <BaseSelect
                v-model="filterStatus"
                :options="statusFilterOptions"
                :placeholder="t('admin.marketing.ads.statusPlaceholder')"
                size="sm"
              />
            </div>
            <div class="md:w-40">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                :placeholder="t('admin.marketing.ads.searchFieldPlaceholder')"
                size="sm"
              />
            </div>
          </template>
        </AdminSearchPanel>
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
          <AdminTag
            :label="value !== false ? t('admin.marketing.ads.tagActive') : t('admin.marketing.ads.tagInactive')"
            :status="value !== false ? 'success' : 'danger'"
            size="sm"
          />
        </template>
        <template #cell-altKey="{ row }">
          <div class="flex flex-col text-xs max-w-xs">
            <span class="text-[var(--text-color)] truncate" :title="row.altKey">
              {{ row.altKey }}
            </span>
            <span class="text-[var(--text-secondary)]">
              {{ t(row.altKey) }}
            </span>
          </div>
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
          <AdminRowActions>
            <BaseButton size="xs" variant="outline" class="px-2" @click.stop="openEdit(row)">
              {{ t('admin.common.edit') }}
            </BaseButton>
            <BaseTooltip
              :text="row.active !== false ? t('admin.marketing.ads.deleteDisabledHint') : ''"
            >
              <BaseButton
                size="xs"
                variant="outline"
                class="px-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                :disabled="row.active !== false"
                @click.stop="handleDelete(row)"
              >
                {{ t('admin.common.delete') }}
              </BaseButton>
            </BaseTooltip>
          </AdminRowActions>
        </template>
      </AdminTable>
    </BaseCard>
    <BaseModal
      v-model="modalOpen"
      :title="editing ? t('admin.marketing.ads.modalTitleEdit') : t('admin.marketing.ads.modalTitleCreate')"
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
          :label="t('admin.marketing.ads.fieldPosition')"
          :placeholder="t('admin.marketing.ads.fieldPositionPlaceholder')"
          class="md:col-span-2"
        />
        <AdminFormField
          v-model.number="form.order"
          required
          component="number"
          :label="t('admin.marketing.ads.fieldOrder')"
          :placeholder="t('admin.marketing.ads.fieldOrderPlaceholder')"
        />
        <AdminFormField
          v-model="form.image"
          class="md:col-span-2"
          :rules="[
            { type: 'url', message: t('admin.marketing.ads.errorImageUrl') }
          ]"
          required
          :label="t('admin.marketing.ads.fieldImage')"
          :placeholder="t('admin.marketing.ads.fieldImagePlaceholder')"
        />
        <AdminFormField
          v-model="form.link"
          class="md:col-span-2"
          :rules="[{ type: 'url', message: t('admin.marketing.ads.errorLinkUrl') }]"
          :label="t('admin.marketing.ads.fieldLink')"
          :placeholder="t('admin.marketing.ads.fieldLinkPlaceholder')"
        />
        <AdminFormField
          v-model="form.altKey"
          class="md:col-span-2"
          required
          :label="t('admin.marketing.ads.fieldAltKey')"
          :placeholder="t('admin.marketing.ads.fieldAltKeyPlaceholder')"
        />
        <div class="flex items-center gap-2 md:col-span-2">
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="form.active" type="checkbox" class="rounded border-[var(--border-color)]" >
            {{ t('admin.marketing.ads.fieldActive') }}
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
          {{ t('admin.marketing.ads.modalCancel') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="listLoading"
          :disabled="listLoading"
          @click="handleSubmit"
        >
          {{ editing ? t('admin.marketing.ads.modalSubmitEdit') : t('admin.marketing.ads.modalSubmitCreate') }}
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
import AdminSearchPanel from '~/modules/admin/components/AdminSearchPanel.vue'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import { http, type ApiResponse } from '~/utils/http'
import { watch } from 'vue'
import { useI18n } from '~/composables/useI18n'
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
const { t } = useI18n()

const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchField = ref<'altKey' | 'id'>('altKey')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = computed(() => [
  { label: t('admin.marketing.ads.searchFieldAltKey'), value: 'altKey' },
  { label: t('admin.marketing.ads.searchFieldId'), value: 'id' }
])

const filterPosition = ref<'ALL' | 'home' | 'wishlist'>('ALL')
const filterStatus = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

const positionFilterOptions = computed(() => [
  { label: t('admin.marketing.ads.positionAll'), value: 'ALL' },
  { label: t('admin.marketing.ads.positionHome'), value: 'home' },
  { label: t('admin.marketing.ads.positionWishlist'), value: 'wishlist' }
])

const statusFilterOptions = computed(() => [
  { label: t('admin.marketing.ads.statusAll'), value: 'ALL' },
  { label: t('admin.marketing.ads.statusActive'), value: 'ACTIVE' },
  { label: t('admin.marketing.ads.statusInactive'), value: 'INACTIVE' }
])

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

  const keyword = searchKeyword.value.trim()
  if (keyword) {
    const field = searchField.value
    if (field === 'id') {
      params.id = keyword
    } else {
      params[field] = keyword
    }
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

const filteredAds = computed(() => ads.value)

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterPosition.value = 'ALL'
  filterStatus.value = 'ALL'
  page.value = 1
  await reloadAds()
}

const applySearch = async () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  await reloadAds()
}

const positionOptions = computed(() => [
  { label: t('admin.marketing.ads.positionHome'), value: 'home' },
  { label: t('admin.marketing.ads.positionWishlist'), value: 'wishlist' }
])

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
  if (listLoading.value) return
  if (!form.position || !form.image || !form.altKey) {
    toast.error(t('admin.marketing.ads.errorRequired'))
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
      toast.success(t('admin.marketing.ads.updateSuccess', { label }))
    } else {
      await http.post<ApiResponse<AdminAd>>('/admin/ads', {
        position: form.position,
        order: form.order,
        active: form.active,
        image: form.image,
        link: form.link,
        altKey: form.altKey
      })
      toast.success(t('admin.marketing.ads.createSuccess', { label }))
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
  if (listLoading.value) return
  if (!row.id || typeof row.id !== 'number') {
    toast.error(t('admin.marketing.ads.errorInvalidId'))
    return
  }

  if (row.active !== false) {
    toast.error(t('admin.marketing.ads.errorCannotDeleteActive'))
    return
  }

  const ok = await confirm(t('admin.marketing.ads.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true

    await http.delete<ApiResponse<null>>(`/admin/ads/${row.id}`)
    toast.success(t('admin.marketing.ads.deleteSuccess', { label: `${row.position} / ${row.altKey}` }))
    await reloadAds()
    if (editing.value && editing.value.id === row.id) {
      editing.value = null
      resetForm()
    }
  } finally {
    listLoading.value = false
  }
}

const columns = computed(() => [
  { key: 'id', label: t('admin.marketing.ads.columnId'), sortable: true, width: 80 },
  { key: 'position', label: t('admin.marketing.ads.columnPosition'), sortable: true, width: 120 },
  { key: 'order', label: t('admin.marketing.ads.columnOrder'), sortable: true, width: 100, align: 'right' as const, minWidth: 100 },
  { key: 'active', label: t('admin.marketing.ads.columnStatus'), sortable: true, width: 100 },
  { key: 'media', label: t('admin.marketing.ads.columnMedia'), sortable: false, width: 260 },
  { key: 'altKey', label: t('admin.marketing.ads.columnAltKey'), sortable: false, width: 220 }
])
</script>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      {{ t('admin.goods.review.title') }}
    </h1>

    <BaseCard class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-[var(--text-secondary)]">
          {{ t('admin.goods.review.total', { count: total }) }}
        </p>
      </div>

      <AdminSearchPanel
        :search-label="t('admin.goods.review.search')"
        :reset-label="t('admin.goods.review.reset')"
        @search="applySearch"
        @reset="clearSearch"
      >
        <template #primary>
          <div class="md:w-40">
            <BaseSelect
              v-model="filterRating"
              :options="ratingOptions"
              :placeholder="t('admin.goods.review.ratingPlaceholder')"
              size="sm"
            />
          </div>
          <div class="flex-1 min-w-[220px]">
            <BaseInput
              v-model="searchKeywordInput"
              class="h-8 w-full"
              clearable
              :placeholder="t('admin.goods.review.searchPlaceholder')"
              @keyup.enter="applySearch"
            />
          </div>
        </template>
      </AdminSearchPanel>

      <AdminTable
        :columns="columns"
        :rows="items"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="total"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-rating="{ value }">
          <div class="flex items-center gap-1">
            <span class="text-xs text-[var(--text-color)]">{{ value }}</span>
            <svg
              v-for="i in 5"
              :key="i"
              :class="i <= value ? 'text-yellow-400' : 'text-[var(--border-color)]'"
              class="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </div>
        </template>
        <template #cell-content="{ value }">
          <span class="block max-w-xs truncate" :title="value">
            {{ value }}
          </span>
        </template>
        <template #cell-createdAt="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ formatDate(value) }}
          </span>
        </template>
        <template #actions="{ row }">
          <AdminRowActions>
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
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminRowActions from '~/modules/admin/components/AdminRowActions.vue'
import AdminSearchPanel from '~/modules/admin/components/AdminSearchPanel.vue'
import { http } from '~/utils/http'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminGoodsReviewPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

interface AdminReview {
  id: string
  productId: number
  userId: string
  username: string
  userAvatar: string
  rating: number
  content: string
  createdAt: string
}

const page = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const searchKeywordInput = ref('')
const filterRating = ref<number | 'ALL'>('ALL')

const ratingOptions = computed(() => [
  { label: t('admin.goods.review.ratingAll'), value: 'ALL' as const },
  { label: t('admin.goods.review.rating5'), value: 5 },
  { label: t('admin.goods.review.rating4'), value: 4 },
  { label: t('admin.goods.review.rating3'), value: 3 },
  { label: t('admin.goods.review.rating2'), value: 2 },
  { label: t('admin.goods.review.rating1'), value: 1 }
])

const buildFilterParams = () => {
  const params: Record<string, string | number> = {
    page: page.value,
    limit: pageSize.value
  }

  if (filterRating.value !== 'ALL') {
    params.rating = filterRating.value as number
  }

  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }

  return params
}

const { data, pending } = await useAsyncData(
  'admin-product-reviews',
  () => http.get<{ code: number; message: string; data: { items: AdminReview[]; total: number } }>(
    '/admin/product-reviews',
    buildFilterParams()
  ),
  { server: false }
)

const items = computed(() => {
  const raw = data.value as any
  const list: AdminReview[] = Array.isArray(raw?.data?.items)
    ? raw.data.items
    : Array.isArray(raw?.items)
      ? raw.items
      : []
  return list
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
  const res = await http.get<{ code: number; message: string; data: { items: AdminReview[]; total: number } }>(
    '/admin/product-reviews',
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

watch(filterRating, async () => {
  page.value = 1
  await reload()
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterRating.value = 'ALL'
  page.value = 1
  await reload()
}

const applySearch = async () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  await reload()
}

const handleDelete = async (row: AdminReview) => {
  const ok = await confirm(t('admin.goods.review.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete<ApiResponse<{ deleted: boolean }>>(`/admin/product-reviews/${row.id}`)
    toast.success(t('admin.goods.review.deleteSuccess'))
    await reload()
  } finally {
    listLoading.value = false
  }
}

const { formatDateTime } = useLocaleFormatter()

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

const columns = computed(() => [
  { key: 'productId', label: t('admin.goods.review.columnProductId'), sortable: true, width: 96 },
  { key: 'username', label: t('admin.goods.review.columnUsername'), sortable: false, width: 140 },
  { key: 'rating', label: t('admin.goods.review.columnRating'), sortable: true, width: 120 },
  { key: 'content', label: t('admin.goods.review.columnContent'), sortable: false, width: 260 },
  { key: 'createdAt', label: t('admin.goods.review.columnCreatedAt'), sortable: true, width: 180 }
])
</script>

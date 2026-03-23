<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.goods.list.title') }}
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ t('admin.goods.list.total', { count: totalProducts }) }}
          </p>
          <BaseButton size="sm" variant="primary" @click="goCreate">
            {{ t('admin.goods.list.createButton') }}
          </BaseButton>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">
            <div class="md:col-span-1">
              <BaseSelect
                v-model="filterCategory"
                :options="categoryFilterOptions"
                :placeholder="t('admin.goods.list.categoryPlaceholder')"
              />
            </div>
            <div class="md:col-span-1">
              <BaseSelect
                v-model="sortMode"
                :options="sortOptions"
                :placeholder="t('admin.goods.list.sortPlaceholder')"
              />
            </div>
            <div class="md:col-span-1">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                :placeholder="t('admin.goods.list.searchFieldPlaceholder')"
              />
            </div>
            <div class="md:col-span-2">
              <BaseInput
                v-model="searchKeywordInput"
                :placeholder="t('admin.goods.list.searchKeywordPlaceholder')"
                @keyup.enter="applySearch"
              />
            </div>
            <div class="flex gap-2 justify-end md:col-span-1">
              <BaseButton size="sm" variant="primary" @click="applySearch">
                {{ t('admin.common.search') }}
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="clearSearch">
                {{ t('admin.common.reset') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns as any"
        :rows="filteredProducts"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalProducts"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-title="{ row }">
          <NuxtLink
            :to="`/products/${row.id}`"
            target="_blank"
            rel="noreferrer"
            class="text-[var(--primary-color)] hover:underline"
          >
            {{ row.title }}
          </NuxtLink>
        </template>
        <template #cell-category="{ value }">
          <AdminTag :label="categoryLabels[value] || value" status="muted" size="sm" />
        </template>
        <template #cell-price="{ value }">
          <span class="text-sm text-[var(--text-color)]">
            ￥{{ value.toFixed(2) }}
          </span>
        </template>
        <template #cell-rating="{ row }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ t('admin.goods.list.ratingSummary', {
              rate: row.rating?.rate ?? '-',
              count: row.rating?.count ?? 0
            }) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton
              size="xs"
              variant="outline"
              @click.stop="goEdit(row)"
            >
              {{ t('admin.common.save') }}
            </BaseButton>
            <BaseButton
              size="xs"
              variant="outline"
              class="text-red-600 hover:bg-red-50 hover:border-red-200"
              @click.stop="handleDelete(row)"
            >
              {{ t('demo.components.confirm.deleteConfirm') }}
            </BaseButton>
          </div>
        </template>
      </AdminTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { useAdminTable } from '~/modules/admin/composables/useAdminTable'
import { useRouter } from '#imports'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminGoodsListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

type AdminProduct = Product

const { categoryLabels } = useCategoryMapper()
const { products: sharedProducts } = useProducts()

const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const filterCategory = ref<'ALL' | string>('ALL')

const {
  page,
  pageSize,
  items: products,
  total: totalProducts,
  pending,
  listLoading,
  tableLoading,
  reload,
  handlePageChange,
  handlePageSizeChange
} = useAdminTable<AdminProduct>({
  key: 'admin-products',
  endpoint: '/admin/products',
  getFilterParams: () => {
    const params: Record<string, string | number> = {}
    if (filterCategory.value !== 'ALL') {
      params.category = filterCategory.value
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.trim()
      const field = searchField.value
      if (field === 'id') {
        params.id = keyword
      } else {
        params[field] = keyword
      }
    }
    params.sort = sortMode.value
    return params
  }
})

watch(
  products,
  (list) => {
    if (list && list.length > 0) {
      sharedProducts.value = list
    }
  },
  { immediate: true }
)

const searchField = ref<'id' | 'title' | 'description'>('title')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = computed(() => [
  { label: t('admin.goods.list.searchFieldTitle'), value: 'title' },
  { label: t('admin.goods.list.searchFieldDescription'), value: 'description' },
  { label: t('admin.goods.list.searchFieldId'), value: 'id' }
])

const sortMode = ref<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default')

const sortOptions = computed(() => [
  { label: t('admin.goods.list.sortDefault'), value: 'default' },
  { label: t('admin.goods.list.sortPriceAsc'), value: 'price-asc' },
  { label: t('admin.goods.list.sortPriceDesc'), value: 'price-desc' },
  { label: t('admin.goods.list.sortRatingDesc'), value: 'rating-desc' }
])

const { data: categoryData } = await useAsyncData(
  'admin-goods-filter-categories',
  () => http.get<{ key: string; label: string }[]>('/products/categories'),
  {
    default: () => [] as { key: string; label: string }[]
  }
)

const categoryFilterOptions = computed(() => {
  const options: { label: string; value: string | 'ALL' }[] = [
    { label: t('admin.goods.list.categoryPlaceholder'), value: 'ALL' }
  ]

  const raw = categoryData.value as any
  const list: { key: string; label: string }[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : []

  const items = list.map((c) => ({
    label: categoryLabels[c.key] || c.label || c.key,
    value: c.key
  }))

  return options.concat(items)
})

const filteredProducts = computed(() => {
  const list = products.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return list
  }

  return list.filter((product) => {
    const field = searchField.value
    const value =
      field === 'id' ? product.id : (product as any)[field]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(keyword)
  })
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterCategory.value = 'ALL'
  sortMode.value = 'default'
  page.value = 1
  await reload()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  reload()
}

onMounted(async () => {
  if (!products.value.length && !pending.value) {
    try {
      listLoading.value = true
      await reload()
    } finally {
      listLoading.value = false
    }
  }
})

watch(filterCategory, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
})

watch(sortMode, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
})

const goCreate = () => {
  router.push('/admin/goods/create')
}

const goEdit = (row: AdminProduct) => {
  router.push(`/admin/goods/${row.id}`)
}

const handleDelete = async (row: AdminProduct) => {
  const ok = await confirm(t('admin.goods.list.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/products/${row.id}`)
    toast.success(t('admin.goods.list.deleteSuccess', { title: row.title }))
    await reload()
  } finally {
    listLoading.value = false
  }
}

const columns = computed(() => [
  { key: 'id', label: t('admin.goods.list.columnId'), sortable: true, width: 80, fixed: 'left' },
  { key: 'title', label: t('admin.goods.list.columnTitle'), sortable: true, width: 260 },
  { key: 'category', label: t('admin.goods.list.columnCategory'), sortable: true, width: 160 },
  { key: 'price', label: t('admin.goods.list.columnPrice'), sortable: true, width: 120 },
  { key: 'rating', label: t('admin.goods.list.columnRating'), sortable: false, width: 140 }
])
</script>

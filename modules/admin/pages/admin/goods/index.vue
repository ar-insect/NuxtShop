<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        商品管理
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            共 {{ totalProducts }} 个商品
          </p>
          <BaseButton size="sm" variant="primary" @click="goCreate">
            新增商品
          </BaseButton>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">
            <div class="md:col-span-1">
              <BaseSelect
                v-model="filterCategory"
                :options="categoryFilterOptions"
                placeholder="全部分类"
              />
            </div>
            <div class="md:col-span-1">
              <BaseSelect
                v-model="sortMode"
                :options="sortOptions"
                placeholder="排序方式"
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
            {{ row.rating?.rate ?? '-' }} 分 / {{ row.rating?.count ?? 0 }} 评
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton
              size="xs"
              variant="outline"
              @click.stop="goEdit(row)"
            >
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
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useRouter } from '#imports'

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

const page = ref(1)
const pageSize = ref(10)
const filterCategory = ref<'ALL' | string>('ALL')

const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  if (filterCategory.value !== 'ALL') {
    params.category = filterCategory.value
  }
  params.page = page.value
  params.limit = pageSize.value
   params.sort = sortMode.value
  return params
}

const { data, pending } = await useAsyncData(
  'admin-products',
  () =>
    http.get<{ code: number; message: string; data: { items: AdminProduct[]; total: number } }>(
      '/admin/products',
      buildFilterParams()
    ),
  { server: false }
)

const products = computed<AdminProduct[]>(() => {
  const raw = data.value as any
  const items: AdminProduct[] = Array.isArray(raw?.data?.items)
    ? raw.data.items
    : Array.isArray(raw?.items)
      ? raw.items
      : []
  return items
})

const totalProducts = computed(() => {
  const raw = data.value as any
  const total =
    typeof raw?.data?.total === 'number'
      ? raw.data.total
      : typeof raw?.total === 'number'
        ? raw.total
        : 0
  return total
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

const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchField = ref<'id' | 'title' | 'description'>('title')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = [
  { label: '名称', value: 'title' },
  { label: '描述', value: 'description' },
  { label: 'ID', value: 'id' }
]

const sortMode = ref<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default')

const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' },
  { label: '评分优先', value: 'rating-desc' }
]

const { data: categoryData } = await useAsyncData(
  'admin-product-categories',
  () => http.get<{ key: string; label: string }[]>('/products/categories'),
  {
    default: () => [] as { key: string; label: string }[]
  }
)

const categoryFilterOptions = computed(() => {
  const options: { label: string; value: string | 'ALL' }[] = [
    { label: '全部分类', value: 'ALL' }
  ]
  const items = (categoryData.value || []).map((c) => ({
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
  await reloadProducts()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
}

const reloadProducts = async () => {
  const res = await http.get<{ code: number; message: string; data: { items: AdminProduct[]; total: number } }>(
    '/admin/products',
    buildFilterParams()
  )
  ;(data.value as any) = res
}

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reloadProducts()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reloadProducts()
  } finally {
    listLoading.value = false
  }
}

watch(filterCategory, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reloadProducts()
  } finally {
    listLoading.value = false
  }
})

watch(sortMode, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reloadProducts()
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
  const ok = await confirm('确定要删除该商品吗？')
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/products/${row.id}`)
    toast.success(`商品已删除：${row.title}`)
    await reloadProducts()
  } finally {
    listLoading.value = false
  }
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, width: 80 },
  { key: 'title', label: '名称', sortable: true, width: 260 },
  { key: 'category', label: '分类', sortable: true, width: 160 },
  { key: 'price', label: '价格', sortable: true, width: 120 },
  { key: 'rating', label: '评分', sortable: false, width: 140 }
]
</script>

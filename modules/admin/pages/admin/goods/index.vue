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
        :rows="filteredProducts"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalProducts"
        server-side
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      >
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
            <BaseButton size="xs" variant="outline" @click.stop="openDetail(row)">
              查看详情
            </BaseButton>
          </div>
        </template>
      </AdminTable>
    </BaseCard>

    <BaseModal
      v-model="detailOpen"
      :title="currentProduct ? `商品详情：${currentProduct.title}` : '商品详情'"
      :close-on-mask="true"
      draggable
      enable-fullscreen
    >
      <div v-if="currentProduct" class="space-y-4">
        <div class="flex gap-4">
          <img
            :src="currentProduct.image"
            alt=""
            class="w-32 h-32 rounded-md border border-[var(--border-color)] object-cover"
          >
          <div class="flex-1 space-y-1">
            <p class="text-lg font-semibold text-[var(--text-color)]">
              {{ currentProduct.title }}
            </p>
            <p class="text-sm text-[var(--text-secondary)]">
              分类：{{ categoryLabels[currentProduct.category] || currentProduct.category }}
            </p>
            <p class="text-sm text-[var(--text-secondary)]">
              价格：￥{{ currentProduct.price.toFixed(2) }}
            </p>
            <p class="text-sm text-[var(--text-secondary)]">
              评分：{{ currentProduct.rating?.rate ?? '-' }} 分 / {{ currentProduct.rating?.count ?? 0 }} 评
            </p>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-[var(--text-color)] mb-1">
            商品描述
          </p>
          <p class="text-sm text-[var(--text-secondary)] whitespace-pre-line">
            {{ currentProduct.description }}
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="detailOpen = false">
          关闭
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
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'

definePageMeta({
  name: 'AdminGoodsListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

type AdminProduct = Product

const { categoryLabels } = useCategoryMapper()
const { products: sharedProducts } = useProducts()

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

const products = computed<AdminProduct[]>(() => data.value?.data.items || [])
const totalProducts = computed(() => data.value?.data.total || 0)

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

const detailOpen = ref(false)
const currentProduct = ref<AdminProduct | null>(null)

const openDetail = (row: AdminProduct) => {
  currentProduct.value = row
  detailOpen.value = true
}

const columns = [
  { key: 'id', label: 'ID', sortable: true, width: 80 },
  { key: 'title', label: '名称', sortable: true, width: 260 },
  { key: 'category', label: '分类', sortable: true, width: 160 },
  { key: 'price', label: '价格', sortable: true, width: 120 },
  { key: 'rating', label: '评分', sortable: false, width: 140 }
]
</script>

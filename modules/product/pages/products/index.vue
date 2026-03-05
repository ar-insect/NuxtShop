<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">商品列表</h1>
      <p class="mt-2 text-lg text-[var(--text-secondary)]">
        浏览我们要选的优质商品。
      </p>
    </div>

    <!-- Search and Filter -->
    <div class="mb-8 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <ProductAutocomplete
          v-model="searchText"
          :products="products || []"
          placeholder="搜索商品名称或描述..."
          @select="handleProductSelect"
          @search="handleSearch"
        />
      </div>
      <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        <button
          type="button"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border"
          :class="!activeCategory 
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'"
          @click="setCategory()"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap capitalize border"
          :class="activeCategory === cat 
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'"
          @click="setCategory(cat)"
        >
          {{ categoryLabels[cat] || cat }}
        </button>
        
        <button
          v-if="activeCategory || activeQuery"
          type="button"
          class="p-2 ml-1 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="清除筛选"
          @click="clearFilters"
        >
          <!-- <span class="font-bold text-sm mr-1">清除</span> -->
          <XMarkIcon class="w-5 h-5 inline-block" stroke-width="2.5" />
        </button>
      </div>
    </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"/>
      </div>

      <!-- Product Grid -->
      <div v-else-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="navigateTo(`/products/${product.id}`)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-[var(--text-color)]">未找到商品</h3>
        <p class="mt-2 text-[var(--text-secondary)]">
          尝试调整搜索词或筛选条件。
        </p>
        <BaseButton
          variant="outline"
          class="mt-6"
          @click="clearFilters"
        >
          清除筛选
        </BaseButton>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !pending && products.length > 0" class="mt-8 flex justify-center">
        <BasePagination
          :model-value="page"
          :total-pages="totalPages"
          :get-to="paginationTo"
        />
      </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import ProductAutocomplete from '~/modules/product/components/Autocomplete.vue'
import ProductCard from '~/modules/product/components/ProductCard.vue'
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'

const route = useRoute()
const router = useRouter()
const { getProducts } = useProducts()
const { categoryLabels } = useCategoryMapper()

const page = computed(() => Number(route.query.page) || 1)
const limit = 16 // Show 16 products per page

const activeCategory = computed<string | undefined>(() => {
  const v = route.query.category
  return typeof v === 'string' && v.trim() ? v : undefined
})

const activeQuery = computed<string>(() => {
  const v = route.query.q
  return typeof v === 'string' ? v.trim() : ''
})

useSeoMeta({
  title: computed(() => {
    if (activeCategory.value && categoryLabels[activeCategory.value]) {
      return `${categoryLabels[activeCategory.value]} - 商品列表`
    }
    if (activeQuery.value) {
      return `搜索：${activeQuery.value} - 商品列表`
    }
    return '商品列表'
  }),
  description: computed(() => {
    if (activeCategory.value && categoryLabels[activeCategory.value]) {
      return `浏览我们的${categoryLabels[activeCategory.value]}系列商品。`
    }
    return '浏览我们精选的各类优质商品。'
  }),
  ogTitle: computed(() => activeCategory.value ? `${categoryLabels[activeCategory.value]} - NuxtShop` : '商品列表 - NuxtShop'),
  ogDescription: '浏览我们精选的各类优质商品。'
})

// 通过 watch 响应路由变化并刷新数据
const { data, pending } = await useAsyncData(
  'products',
  () => getProducts(page.value, limit, activeCategory.value, activeQuery.value),
  {
    watch: [page, activeCategory, activeQuery], // 当页码/分类/搜索词变化时重新拉取
    default: () => ({ items: [], total: 0 })
  }
)

const products = computed(() => {
  return data.value?.items || []
})

const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

const categories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing"
]

const paginationTo = (p: number) => {
  return { path: '/products', query: { ...route.query, page: p } }
}

const searchText = ref<string>(activeQuery.value)

// 将搜索框内容与路由 query 同步
watch(activeQuery, (newVal) => {
  searchText.value = newVal
})

const setCategory = (category?: string) => {
  router.push({
    path: '/products',
    query: {
      ...route.query,
      category: category || undefined,
      page: 1 // 筛选条件变化时重置到第 1 页
    }
  })
}

const clearFilters = () => {
  searchText.value = ''
  router.push({
    path: '/products',
    query: {
      page: 1
    }
  })
}

// 搜索防抖
let debounceTimer: NodeJS.Timeout | null = null
const debouncedSearch = (newVal: string) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    // 仅在 query 实际变化时更新，避免重复 push
    if (newVal !== activeQuery.value) {
      router.push({
        path: '/products',
        query: {
          ...route.query,
          q: newVal || undefined,
          page: 1 // 搜索时重置到第 1 页
        }
      })
    }
  }, 300)
}

watch(searchText, (newVal) => {
  debouncedSearch(newVal)
})

const handleProductSelect = (product: Product) => {
  searchText.value = product.title
  debouncedSearch(product.title)
  // 如需选择后直接跳转到商品详情，可取消下面注释
  // router.push(`/products/${product.id}`)
}

const handleSearch = (query: string) => {
  searchText.value = query
  // debouncedSearch 会由 watch(searchText) 触发
}

const highlightText = (text: string, query: string) => {
  if (!query) return text
  // 转义 query 中的特殊字符，避免正则错误
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 rounded-sm px-0.5">$1</mark>')
}
</script>

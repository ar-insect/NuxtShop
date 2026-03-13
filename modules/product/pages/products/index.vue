<template>
  <ClientOnly>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">商品列表</h1>
      <p class="mt-2 text-lg text-[var(--text-secondary)]">
        浏览我们要选的优质商品。
      </p>
    </div>

    <!-- Search and Filter -->
    <div class="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
        <div
          class="inline-flex items-center rounded-lg border transition-all duration-200 whitespace-nowrap"
          :class="!activeCategory 
            ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-sm' 
            : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--bg-color)]'"
        >
          <button
            type="button"
            class="px-4 py-1.5 text-sm font-medium flex items-center gap-1.5"
            @click="setCategory()"
          >
            <Squares2X2Icon class="w-4 h-4" />
            全部
          </button>
          <button
            v-if="!activeCategory && activeQuery"
            type="button"
            class="mr-1 p-1.5 rounded-full hover:bg-white/15 transition-colors"
            aria-label="清除筛选"
            @click="clearFilters"
          >
            <XMarkIcon class="w-4 h-4" stroke-width="2.5" />
          </button>
        </div>

        <div
          v-for="cat in categories"
          :key="cat"
          class="inline-flex items-center rounded-lg border transition-all duration-200 whitespace-nowrap capitalize"
          :class="activeCategory === cat 
            ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-sm' 
            : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--bg-color)]'"
        >
          <button
            type="button"
            class="px-4 py-1.5 text-sm font-medium flex items-center gap-1.5"
            @click="setCategory(cat)"
          >
            <component :is="getCategoryIcon(cat)" class="w-4 h-4" />
            {{ categoryLabels[cat] || cat }}
          </button>
          <button
            v-if="activeCategory === cat"
            type="button"
            class="mr-1 p-1.5 rounded-full hover:bg-white/15 transition-colors"
            aria-label="清除筛选"
            @click="clearFilters"
          >
            <XMarkIcon class="w-4 h-4" stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-[var(--text-secondary)] whitespace-nowrap">排序：</label>
        <select
          v-model="sortKey"
          class="border border-[var(--border-color)] bg-[var(--card-bg)] text-sm px-2 py-1 rounded-md text-[var(--text-color)]"
        >
          <option value="default">综合排序</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="rating-desc">评分优先</option>
        </select>
      </div>
    </div>

    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
      <p class="text-[var(--text-secondary)]">
        当前筛选：
        <span v-if="activeCategory && categoryLabels[activeCategory]">
          分类「{{ categoryLabels[activeCategory] }}」
        </span>
        <span v-else>
          全部分类
        </span>
        <span v-if="activeQuery">
          ，关键字「{{ activeQuery }}」
        </span>
        <span>，共 {{ total }} 件商品</span>
      </p>
      <button
        v-if="activeCategory || activeQuery"
        type="button"
        class="text-xs sm:text-sm text-[var(--primary-color)] hover:underline self-start sm:self-auto"
        @click="clearFilters"
      >
        清除所有筛选
      </button>
    </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCardSkeleton v-for="n in 8" :key="n" />
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { ComputerDesktopIcon, SparklesIcon, Squares2X2Icon, UserCircleIcon, UserIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ProductAutocomplete from '~/modules/product/components/Autocomplete.vue'
import ProductCard from '~/modules/product/components/ProductCard.vue'
import ProductCardSkeleton from '~/modules/product/components/ProductCardSkeleton.vue'
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'

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

// 从 MongoDB 动态获取商品分类列表
const { data: categoryData } = await useAsyncData(
  'product-categories',
  () => http.get<{ key: string; label: string }[]>('/products/categories'),
  {
    default: () => [] as { key: string; label: string }[]
  }
)

const categories = computed(() => categoryData.value?.map(c => c.key) || [])

const sortKey = ref<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default')

// 通过 watch 响应路由变化并刷新数据
const { data, pending } = await useAsyncData(
  'products',
  () => getProducts(page.value, limit, activeCategory.value, activeQuery.value, sortKey.value),
  {
    watch: [page, activeCategory, activeQuery, sortKey], // 当页码/分类/搜索词变化时重新拉取
    default: () => ({ items: [], total: 0 })
  }
)

const products = computed(() => data.value?.items || [])

const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

const categoryIcons: Record<string, any> = {
  electronics: ComputerDesktopIcon,
  jewelery: SparklesIcon,
  "men's clothing": UserIcon,
  "women's clothing": UserCircleIcon
}
const getCategoryIcon = (key: string) => {
  return categoryIcons[key] || Squares2X2Icon
}

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

</script>

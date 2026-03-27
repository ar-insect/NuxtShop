<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">{{ t('pages.products.list.title') }}</h1>
      <p class="mt-2 text-lg text-[var(--text-secondary)]">
        {{ t('pages.products.list.subtitle') }}
      </p>
    </div>

    <!-- Search and Filter -->
    <div class="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex-1">
        <ProductAutocomplete
          v-model="searchText"
          :products="products || []"
          :placeholder="t('pages.products.list.searchPlaceholder')"
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
            {{ t('pages.products.list.allCategory') }}
          </button>
          <button
            v-if="!activeCategory && activeQuery"
            type="button"
            class="mr-1 p-1.5 rounded-full hover:bg-white/15 transition-colors"
            :aria-label="t('pages.products.list.clearFilterAria')"
            @click="clearFilters"
          >
            <XMarkIcon class="w-4 h-4" stroke-width="2.5" />
          </button>
        </div>

        <div
          v-for="cat in categories"
          :key="cat.key"
          class="inline-flex items-center rounded-lg border transition-all duration-200 whitespace-nowrap capitalize"
          :class="activeCategory === cat.key 
            ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-sm' 
            : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--bg-color)]'"
        >
          <button
            type="button"
            class="px-4 py-1.5 text-sm font-medium flex items-center gap-1.5"
            @click="setCategory(cat.key)"
          >
            <component :is="getCategoryIcon(cat.key)" class="w-4 h-4" />
            {{ categoryLabelMap[cat.key] || cat.label || cat.key }}
          </button>
          <button
            v-if="activeCategory === cat.key"
            type="button"
            class="mr-1 p-1.5 rounded-full hover:bg-white/15 transition-colors"
            :aria-label="t('pages.products.list.clearFilterAria')"
            @click="clearFilters"
          >
            <XMarkIcon class="w-4 h-4" stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {{ t('pages.products.list.sortLabel') }}
        </span>
        <BaseSelect
          v-model="sortKey"
          :options="sortOptions"
          size="sm"
        />
      </div>
    </div>

    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
      <p class="text-[var(--text-secondary)]">
        {{ t('pages.products.list.filterCurrent') }}
        <span v-if="activeCategory && categoryLabelMap[activeCategory]">
          {{ t('pages.products.list.filterCategory', { category: categoryLabelMap[activeCategory] }) }}
        </span>
        <span v-else>
          {{ t('pages.products.list.filterAll') }}
        </span>
        <span v-if="activeQuery">
          {{ t('pages.products.list.filterKeyword', { keyword: activeQuery }) }}
        </span>
        <span>{{ t('pages.products.list.filterCount', { count: total }) }}</span>
      </p>
      <button
        v-if="activeCategory || activeQuery"
        type="button"
        class="text-xs sm:text-sm text-[var(--primary-color)] hover:underline self-start sm:self-auto"
        @click="clearFilters"
      >
        {{ t('pages.products.list.clearAllFilters') }}
      </button>
    </div>

      <!-- Loading State -->
      <div v-if="pending && products.length === 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <!-- Product Grid (fixed 4 columns on desktop) -->
      <div
        v-else-if="products.length > 0"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <div
          v-for="product in products"
          :key="product.id"
          @click="navigateTo(`/products/${product.id}`)"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-[var(--text-color)]">{{ t('pages.products.list.emptyTitle') }}</h3>
        <p class="mt-2 text-[var(--text-secondary)]">
          {{ t('pages.products.list.emptyDesc') }}
        </p>
        <BaseButton
          variant="outline"
          class="mt-6"
          @click="clearFilters"
        >
          {{ t('pages.products.list.emptyButton') }}
        </BaseButton>
      </div>

      <!-- Infinite Load More -->
      <div
        v-if="hasMore"
        ref="loadMoreRef"
        class="mt-8 flex justify-center text-xs text-[var(--text-secondary)]"
      >
        <span v-if="loadingMore">
          {{ t('ui.loading') }}
        </span>
        <span v-else>
          {{ t('pages.products.list.loadMoreHint') }}
        </span>
      </div>
      <div
        v-else-if="products.length > 0"
        class="mt-8 flex justify-center text-xs text-[var(--text-secondary)]"
      >
        {{ t('pages.products.list.noMore') }}
      </div>

      <!-- Back To Top -->
      <button
        v-if="showBackToTop"
        type="button"
        class="back-to-top-btn"
        :aria-label="t('pages.products.list.backToTop')"
        @click="scrollToTop"
      >
        <ArrowUpIcon class="w-5 h-5" />
      </button>
  </div>
</template>

<script setup lang="ts">
import { ComputerDesktopIcon, SparklesIcon, Squares2X2Icon, UserCircleIcon, UserIcon, XMarkIcon, ArrowUpIcon } from '@heroicons/vue/24/outline'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import ProductAutocomplete from '~/modules/product/components/Autocomplete.vue'
import ProductCard from '~/modules/product/components/ProductCard.vue'
import ProductCardSkeleton from '~/modules/product/components/ProductCardSkeleton.vue'
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { getProducts } = useProducts()
const { categoryLabels } = useCategoryMapper()
const { t } = useI18n()

const activeCategory = computed<string | undefined>(() => {
  const v = route.query.category
  return typeof v === 'string' && v.trim() ? v : undefined
})

const activeQuery = computed<string>(() => {
  const v = route.query.q
  return typeof v === 'string' ? v.trim() : ''
})

// 从 MongoDB 动态获取商品分类列表（供前台商品列表和后台商品表单复用）
const { data: categoryData } = await useAsyncData(
  'product-categories',
  () => http.get<{ key: string; label: string }[]>('/products/categories'),
  {
    default: () => [] as { key: string; label: string }[]
  }
)

const categories = computed(() => categoryData.value || [])

const categoryLabelMap = computed<Record<string, string>>(() => {
  const fromServer: Record<string, string> = {}
  for (const c of categoryData.value || []) {
    fromServer[c.key] = c.label
  }
  return {
    // 优先使用服务端自定义分类名称，新分类可以直接生效；
    // 对于默认分类（electronics 等），使用内置的中文映射覆盖英文 key。
    ...fromServer,
    ...categoryLabels
  }
})

useSeoMeta({
  title: computed(() => {
    if (activeCategory.value && categoryLabelMap.value[activeCategory.value]) {
      return t('seo.products.listCategoryTitle', { category: categoryLabelMap.value[activeCategory.value] })
    }
    if (activeQuery.value) {
      return t('seo.products.listSearchTitle', { keyword: activeQuery.value })
    }
    return t('seo.products.listTitle')
  }),
  description: computed(() => {
    if (activeCategory.value && categoryLabelMap.value[activeCategory.value]) {
      return t('seo.products.listCategoryDescription', { category: categoryLabelMap.value[activeCategory.value] })
    }
    if (activeQuery.value) {
      return t('seo.products.listSearchDescription', { keyword: activeQuery.value })
    }
    return t('seo.products.listDescription')
  }),
  ogTitle: computed(() => t('seo.products.listTitle')),
  ogDescription: t('seo.products.listDescription')
})

const sortKey = ref<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default')

const sortOptions = computed(() => [
  { label: t('pages.products.list.sortDefault'), value: 'default' },
  { label: t('pages.products.list.sortPriceAsc'), value: 'price-asc' },
  { label: t('pages.products.list.sortPriceDesc'), value: 'price-desc' },
  { label: t('pages.products.list.sortRatingDesc'), value: 'rating-desc' }
])

const limit = 16

// 首屏数据，支持 SSR（仅加载第 1 页）
const { data: firstPageData, pending } = await useAsyncData(
  'products',
  () => getProducts(1, limit, activeCategory.value, activeQuery.value, sortKey.value),
  {
    watch: [activeCategory, activeQuery, sortKey],
    default: () => ({ items: [] as Product[], total: 0 })
  }
)

const products = ref<Product[]>(firstPageData.value?.items || [])
const total = ref(firstPageData.value?.total || 0)
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)

watch(
  firstPageData,
  (val) => {
    const data = val || { items: [] as Product[], total: 0 }
    products.value = data.items
    total.value = data.total
    currentPage.value = 1
    hasMore.value = products.value.length === limit
  },
  { immediate: true }
)

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const result = await getProducts(
      nextPage,
      limit,
      activeCategory.value,
      activeQuery.value,
      sortKey.value
    )
    const existingIds = new Set(products.value.map(p => p.id))
    const newItems = result.items.filter(item => !existingIds.has(item.id))

    if (newItems.length === 0) {
      hasMore.value = false
      return
    }

    products.value = [...products.value, ...newItems]
    total.value = result.total
    currentPage.value = nextPage

    if (newItems.length < limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
    }
  } finally {
    loadingMore.value = false
  }
}

const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const showBackToTop = ref(false)

const handleScroll = () => {
  if (typeof window === 'undefined') return
  showBackToTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting) {
        loadMore()
      }
    },
    { rootMargin: '200px' }
  )

  if (loadMoreRef.value && observer) {
    observer.observe(loadMoreRef.value)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

watch(
  () => loadMoreRef.value,
  (el) => {
    if (observer && el && hasMore.value) {
      observer.observe(el)
    }
  }
)

watch(
  hasMore,
  (val) => {
    if (!observer || !loadMoreRef.value) return
    if (val) {
      observer.observe(loadMoreRef.value)
    } else {
      observer.unobserve(loadMoreRef.value)
    }
  }
)

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

const categoryIcons: Record<string, any> = {
  electronics: ComputerDesktopIcon,
  jewelery: SparklesIcon,
  "men's clothing": UserIcon,
  "women's clothing": UserCircleIcon
}
const getCategoryIcon = (key: string) => {
  return categoryIcons[key] || Squares2X2Icon
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
      category: category || undefined
    }
  })
}

const clearFilters = () => {
  searchText.value = ''
  router.push({
    path: '/products',
    query: {
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
          q: newVal || undefined
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

<style scoped>
.back-to-top-btn {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  /* border: 1px solid rgba(148, 163, 184, 0.35); */
  background: radial-gradient(circle at 10% 20%, rgba(248, 250, 252, 0.9) 0, rgba(226, 232, 240, 0.65) 40%, rgba(148, 163, 184, 0.35) 100%);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: var(--primary-color);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.back-to-top-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.back-to-top-btn:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);
}
</style>

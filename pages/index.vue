<template>
  <ClientOnly>
  <div class="space-y-14">
    <HomeHero 
      :cart-count="cartCount"
      :wishlist-count="wishlistItems.length"
      :category-cards="categoryCards"
      @search="(q) => goToProducts({ q })"
      @navigate="goToProducts"
    />

    <!-- Ad Carousel -->
    <section class="px-4 sm:px-6 lg:px-8">
      <BaseAdCarousel :ads="ads" />
    </section>

    <CategoryShowcase 
      :categories="categoryCards" 
      @navigate="goToProducts" 
    />

    <section class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-[var(--text-color)]">{{ t('pages.home.recommendTitle') }}</h2>
          <p class="mt-1 text-[var(--text-secondary)]">{{ t('pages.home.recommendSubtitle') }}</p>
        </div>
        <NuxtLink to="/products" class="text-sm font-medium text-[var(--text-color)] hover:text-[var(--primary-color)]">
          {{ t('pages.home.recommendMore') }} →
        </NuxtLink>
      </div>

      <div v-if="pending" class="px-4">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCardSkeleton v-for="n in 4" :key="n" />
        </div>
      </div>

      <div
        v-else
        class="relative"
        @mouseenter="isCarouselHovering = true"
        @mouseleave="isCarouselHovering = false"
      >
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${activeSlide * 100}%)` }"
          >
            <div
              v-for="(slide, idx) in recommendedSlides"
              :key="idx"
              class="w-full shrink-0"
            >
              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
                <ProductCard
                  v-for="p in slide"
                  :key="p.id"
                  :product="p"
                  @click="navigateTo(`/products/${p.id}`)"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="recommendedSlides.length > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-[var(--border-color)] text-[var(--text-color)] shadow-sm transition-all hover:bg-[var(--card-bg)]"
          :style="{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--card-bg), transparent 10%)' }"
          :aria-label="t('pages.home.carouselPrev')"
          @click="prevSlide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L7.414 9H17a1 1 0 110 2H7.414l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          v-if="recommendedSlides.length > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-[var(--border-color)] text-[var(--text-color)] shadow-sm transition-all hover:bg-[var(--card-bg)]"
          :style="{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--card-bg), transparent 10%)' }"
          :aria-label="t('pages.home.carouselNext')"
          @click="nextSlide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586L7.293 4.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <div v-if="recommendedSlides.length > 1" class="mt-5 flex items-center justify-center gap-2">
          <button
            v-for="(_, i) in recommendedSlides"
            :key="i"
            type="button"
            class="h-2.5 w-2.5 transition-all"
            :style="{ borderRadius: '999px', backgroundColor: i === activeSlide ? 'var(--primary-color)' : 'var(--border-color)' }"
            :aria-label="t('pages.home.carouselDot', { index: i + 1 })"
            @click="goToSlide(i)"
          />
        </div>
      </div>
    </section>

    <section
      v-if="trendingPending || trendingProducts.length > 0"
      class="px-4 sm:px-6 lg:px-8"
    >
      <div class="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 class="text-2xl font-bold text-[var(--text-color)]">{{ t('pages.home.trendingTitle') }}</h2>
          <p class="mt-1 text-[var(--text-secondary)]">{{ t('pages.home.trendingSubtitle') }}</p>
        </div>
      </div>

      <div v-if="trendingPending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCardSkeleton v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="trendingProducts.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="p in trendingProducts"
          :key="p.id"
          :product="p"
          @click="navigateTo(`/products/${p.id}`)"
        />
      </div>
    </section>

    <section
      v-if="favoritedPending || favoritedProducts.length > 0"
      class="px-4 sm:px-6 lg:px-8"
    >
      <div class="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 class="text-2xl font-bold text-[var(--text-color)]">{{ t('pages.home.favoritedTitle') }}</h2>
          <p class="mt-1 text-[var(--text-secondary)]">{{ t('pages.home.favoritedSubtitle') }}</p>
        </div>
      </div>

      <div v-if="favoritedPending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCardSkeleton v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="favoritedProducts.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="p in favoritedProducts"
          :key="p.id"
          :product="p"
          @click="navigateTo(`/products/${p.id}`)"
        />
      </div>
    </section>

    <section class="border border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-10" :style="{ borderRadius: 'var(--border-radius)' }">
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <SvgIcon name="sparkles" class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">{{ t('pages.home.featureCategoriesTitle') }}</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">{{ t('pages.home.featureCategoriesDesc') }}</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <SvgIcon name="shield-check" class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">{{ t('pages.home.featureSafeTitle') }}</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">{{ t('pages.home.featureSafeDesc') }}</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <SvgIcon name="sparkles" class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">{{ t('pages.home.featureThemeTitle') }}</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">{{ t('pages.home.featureThemeDesc') }}</div>
          </div>
        </div>
      </div>
    </section>

    <Newsletter @subscribe="subscribe" />
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'
import { validateEmail } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'
import HomeHero from '~/components/home/HomeHero.vue'
import CategoryShowcase from '~/components/home/CategoryShowcase.vue'
import Newsletter from '~/components/home/Newsletter.vue'
import ProductCard from '~/modules/product/components/ProductCard.vue'
import ProductCardSkeleton from '~/modules/product/components/ProductCardSkeleton.vue'
import BaseAdCarousel from '~/components/ui/BaseAdCarousel.vue' // 引入 BaseAdCarousel
import SvgIcon from '~/components/ui/SvgIcon.vue'

const { t } = useI18n()

useSeoMeta({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  ogTitle: t('seo.home.title'),
  ogDescription: t('seo.home.description'),
  ogImage: '/og-image.png'
})

const ads = [
  { id: 1, image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80', link: '/products?category=electronics', alt: t('pages.home.adElectronics') },
  { id: 2, image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80', link: '/products?category=jewelery', alt: t('pages.home.adJewelery') },
  { id: 3, image: 'https://images.unsplash.com/photo-1523381294911-8d3cead290f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80', link: '/products?category=men%27s%20clothing', alt: t('pages.home.adMen') }
]

const router = useRouter()
const toast = useToast()
const { cartCount } = useCart()
const { wishlistItems } = useWishlist()
const { getProducts } = useProducts()
const { getCategoryLabel } = useCategoryMapper()

const email = ref('')

const subscribe = () => {
  const emailError = validateEmail(email.value)
  if (emailError) {
    toast.error(t(emailError))
    return
  }
  toast.success(t('toast.subscribeSuccess'))
  email.value = ''
}

const { data: productsData, pending } = await useAsyncData(
  'home-products',
  () => getProducts(1, 100), // Get all products for home page filtering
  { default: () => ({ items: [], total: 0 }) }
)

const products = computed(() => productsData.value?.items || [])

interface TrendingItem extends Product {
  views: number
}

const { data: trendingData, pending: trendingPending } = await useAsyncData(
  'trending-products',
  () => http.get<{ success: boolean; items: { product: Product; views: number }[] }>(
    '/history/top-products',
    { days: 7, limit: 8 }
  ),
  { default: () => ({ success: true, items: [] as { product: Product; views: number }[] }) }
)

const trendingProducts = computed<TrendingItem[]>(() => {
  const payload = trendingData.value
  if (!payload || !payload.items) return []
  return payload.items.map((i) => ({
    ...i.product,
    views: i.views
  }))
})

interface FavoritedItem extends Product {
  favorites: number
}

const { data: favoritedData, pending: favoritedPending } = await useAsyncData(
  'favorited-products',
  () => http.get<{ success: boolean; items: { product: Product; favorites: number }[] }>(
    '/wishlist/top-products',
    { days: 7, limit: 8 }
  ),
  { default: () => ({ success: true, items: [] as { product: Product; favorites: number }[] }) }
)

const favoritedProducts = computed<FavoritedItem[]>(() => {
  const payload = favoritedData.value
  if (!payload || !payload.items) return []
  return payload.items.map((i) => ({
    ...i.product,
    favorites: i.favorites
  }))
})

const primaryTint = ref('rgba(59,130,246,0.22)')

onMounted(() => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
  if (v) {
    primaryTint.value = `${v}22`
  }
})

const categoryMeta: Record<string, { description: string; icon: string; image: string }> = {
  "electronics": {
    description: '数码产品、手机与配件',
    icon: 'computer-desktop',
    image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=600&q=80'
  },
  "women's clothing": {
    description: '时尚潮流、裙装与上衣',
    icon: 'user-circle',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'
  },
  "men's clothing": {
    description: '日常穿搭、外套与基础款',
    icon: 'user',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=600&q=80'
  },
  'jewelery': {
    description: '戒指、耳饰、手链等',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80'
  }
}

const categoryCards = computed(() => {
  const counts = products.value.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  return Object.keys(counts).map((key) => {
    const meta = categoryMeta[key] || { 
      description: '精选商品分类', 
      icon: 'sparkles', 
      image: 'https://images.unsplash.com/photo-1472851294608-415522f96319?auto=format&fit=crop&w=600&q=80' 
    }
    return { key, ...meta, label: getCategoryLabel(key), count: counts[key] }
  }).sort((a, b) => b.count - a.count)
})

const recommended = computed(() => {
  return [...products.value]
    .sort((a, b) => (b.rating.rate * Math.log10(b.rating.count + 10)) - (a.rating.rate * Math.log10(a.rating.count + 10)))
    .slice(0, 8)
})

const itemsPerSlide = ref(4)
const activeSlide = ref(0)
const isCarouselHovering = ref(false)
let carouselTimer: ReturnType<typeof setInterval> | null = null

const updateItemsPerSlide = () => {
  if (import.meta.server) return
  const w = window.innerWidth
  if (w >= 1280) itemsPerSlide.value = 4
  else if (w >= 1024) itemsPerSlide.value = 3
  else if (w >= 640) itemsPerSlide.value = 2
  else itemsPerSlide.value = 1
}

const recommendedSlides = computed(() => {
  const size = Math.max(1, itemsPerSlide.value)
  const out: Product[][] = []
  for (let i = 0; i < recommended.value.length; i += size) {
    out.push(recommended.value.slice(i, i + size))
  }
  return out
})

watch(recommendedSlides, (slides) => {
  if (activeSlide.value > slides.length - 1) activeSlide.value = 0
})

const goToSlide = (idx: number) => {
  activeSlide.value = idx
}

const nextSlide = () => {
  const len = recommendedSlides.value.length
  if (len <= 1) return
  activeSlide.value = (activeSlide.value + 1) % len
}

const prevSlide = () => {
  const len = recommendedSlides.value.length
  if (len <= 1) return
  activeSlide.value = (activeSlide.value - 1 + len) % len
}

onMounted(() => {
  updateItemsPerSlide()
  window.addEventListener('resize', updateItemsPerSlide)
  carouselTimer = setInterval(() => {
    if (!isCarouselHovering.value) nextSlide()
  }, 4500)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateItemsPerSlide)
  if (carouselTimer) clearInterval(carouselTimer)
})

const goToProducts = (query?: Record<string, string | undefined>) => {
  const q = (query?.q ?? '').trim()
  const normalized: Record<string, string> = {}
  if (query?.category) normalized.category = query.category
  if (q) normalized.q = q
  router.push({ path: '/products', query: normalized })
}

</script>

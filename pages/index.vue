<template>
  <div class="space-y-14">
    <HomeHero 
      :cart-count="cartCount"
      :wishlist-count="wishlistItems.length"
      :category-cards="categoryCards"
      @search="(q) => goToProducts({ q })"
      @navigate="goToProducts"
    />

    <CategoryShowcase 
      :categories="categoryCards" 
      @navigate="goToProducts" 
    />

    <section class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-[var(--text-color)]">推荐商品</h2>
          <p class="mt-1 text-[var(--text-secondary)]">按评分与热度精选，支持加入购物车与收藏</p>
        </div>
        <NuxtLink to="/products" class="text-sm font-medium text-[var(--text-color)] hover:text-[var(--primary-color)]">
          去逛更多 →
        </NuxtLink>
      </div>

      <BaseLoading :loading="pending" text="正在加载推荐商品..." />

      <div
        v-if="!pending"
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
              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div
                  v-for="p in slide"
                  :key="p.id"
                  class="group relative flex flex-col border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  :style="{ borderRadius: 'var(--border-radius)' }"
                >
                  <NuxtLink :to="`/products/${p.id}`" class="block flex-1">
                    <div class="relative flex aspect-square items-center justify-center overflow-hidden bg-[var(--bg-color)] p-6 transition-colors group-hover:bg-[var(--border-color)]" :style="{ borderRadius: 'var(--border-radius)' }">
                      <img :src="p.image" :alt="p.title" class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" >
                      <div class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5"/>
                    </div>
                    <div class="mt-4 space-y-2">
                      <div class="line-clamp-2 text-sm font-semibold text-[var(--text-color)] transition-colors group-hover:text-[var(--primary-color)]">{{ p.title }}</div>
                      <div class="flex items-center justify-between gap-3">
                        <div class="text-lg font-bold text-[var(--text-color)]">¥{{ p.price }}</div>
                        <div class="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <StarIcon class="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span class="font-medium text-[var(--text-color)]">{{ p.rating.rate }}</span>
                          <span>({{ p.rating.count }})</span>
                        </div>
                      </div>
                      <div class="text-xs text-[var(--text-secondary)] capitalize">{{ getCategoryLabel(p.category) }}</div>
                    </div>
                  </NuxtLink>

                  <div class="mt-4 flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
                    <template v-if="isAuthenticated">
                      <StyledButton :primary="true" class="!m-0 flex-1 !py-2 !text-sm font-medium shadow-sm hover:!shadow-md active:scale-95" @click="addToCartAndToast(p)">
                        加入购物车
                      </StyledButton>
                      <ClientOnly>
                        <button
                          class="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-90"
                          :style="{ borderRadius: 'var(--border-radius)' }"
                          :aria-label="isInWishlist(p.id) ? '取消收藏' : '加入收藏'"
                          type="button"
                          @click="toggleWishlist(p)"
                        >
                          <HeartIcon class="h-5 w-5" :class="{ 'fill-current text-red-500': isInWishlist(p.id) }" />
                        </button>
                      </ClientOnly>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="recommendedSlides.length > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-[var(--border-color)] text-[var(--text-color)] shadow-sm transition-all hover:bg-[var(--card-bg)]"
          :style="{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--card-bg), transparent 10%)' }"
          aria-label="上一页"
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
          aria-label="下一页"
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
            :aria-label="`跳转到第 ${i + 1} 页`"
            @click="goToSlide(i)"
          />
        </div>
      </div>
    </section>

    <section class="border border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-10" :style="{ borderRadius: 'var(--border-radius)' }">
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <ShoppingBagIcon class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">丰富品类</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">基础电商结构：分类、列表、详情、购物车、收藏</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <ShieldCheckIcon class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">安全示例</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">示例级数据与交互，不涉及真实支付与敏感信息</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center bg-[var(--primary-color)]/10" :style="{ borderRadius: 'var(--border-radius)' }">
            <SparklesIcon class="h-5 w-5" :style="{ color: 'var(--primary-color)' }" />
          </div>
          <div>
            <div class="text-sm font-semibold text-[var(--text-color)]">可配置皮肤</div>
            <div class="mt-1 text-sm text-[var(--text-secondary)]">主题色与圆角由 CSS 变量驱动，支持实时切换</div>
          </div>
        </div>
      </div>
    </section>

    <Newsletter @subscribe="subscribe" />
  </div>
</template>

<script setup lang="ts">
import {
  HeartIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import StyledButton from '~/components/ui/StyledButton'
import HomeHero from '~/components/home/HomeHero.vue'
import CategoryShowcase from '~/components/home/CategoryShowcase.vue'
import Newsletter from '~/components/home/Newsletter.vue'

useSeoMeta({
  title: '首页',
  description: 'Nuxt3 演示项目首页，展示商品列表、购物车和收藏夹功能。',
  ogTitle: 'Nuxt3 演示 - 首页',
  ogDescription: '发现你喜欢的好物。Nuxt 3 电商风格首页示例：商品推荐、分类入口、加入购物车与收藏。',
  ogImage: '/og-image.png'
})

const router = useRouter()
const toast = useToast()
const { addToCart, cartCount } = useCart()
const { wishlistItems, toggleWishlist, isInWishlist } = useWishlist()
const { getProducts } = useProducts()
const { getCategoryLabel } = useCategoryMapper()
const { isAuthenticated } = useAuth()

const email = ref('')

const subscribe = () => {
  if (!email.value) {
    toast.error('请输入有效的邮箱地址')
    return
  }
  toast.success('订阅成功！感谢您的关注')
  email.value = ''
}

const { data: productsData, pending } = await useAsyncData(
  'home-products',
  () => getProducts(1, 100), // Get all products for home page filtering
  { default: () => ({ items: [], total: 0 }) }
)

const products = computed(() => productsData.value?.items || [])

const primaryTint = ref('rgba(59,130,246,0.22)')

onMounted(() => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
  if (v) {
    primaryTint.value = `${v}22`
  }
})

const categoryMeta: Record<string, { description: string; icon: any; image: string }> = {
  "men's clothing": { 
    description: '日常穿搭、外套与基础款', 
    icon: ShoppingBagIcon,
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=600&q=80'
  },
  'jewelery': { 
    description: '戒指、耳饰、手链等', 
    icon: SparklesIcon,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80'
  },
  "electronics": { 
    description: '数码产品、手机与配件', 
    icon: TagIcon,
    image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=600&q=80'
  },
  "women's clothing": { 
    description: '时尚潮流、裙装与上衣', 
    icon: ShoppingBagIcon,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'
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
      icon: TagIcon, 
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

const addToCartAndToast = (p: Product) => {
  addToCart(p)
  toast.success(`已加入购物车：${p.title}`)
}
</script>

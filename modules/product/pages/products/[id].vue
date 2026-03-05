
<template>
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <BaseLoading :loading="pending" text="正在加载商品详情..." />

    <div v-if="error" class="text-center py-12">
      <h3 class="mt-2 text-sm font-medium text-[var(--text-color)]">未找到商品</h3>
      <div class="mt-6">
        <NuxtLink to="/products">
          <BaseButton variant="primary">返回商品列表</BaseButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="product" class="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-x-8 lg:items-start">
      <!-- Image gallery -->
      <div class="flex flex-col gap-4">
        <div class="w-full grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div
            ref="imageContainerRef"
            class="relative w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden sm:aspect-w-2 sm:aspect-h-3 lg:aspect-w-3 lg:aspect-h-4 border"
            :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }"
            @mouseenter="handleZoomEnter"
            @mouseleave="handleZoomLeave"
            @mousemove="handleZoomMove"
          >
            <img
              :src="selectedImage || product.image"
              :alt="product.title"
              class="w-full h-full object-center object-contain p-4 sm:p-6 select-none transition-opacity duration-300"
              draggable="false"
              @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image'"
            >

            <div
              v-if="isZoomActive"
              class="absolute pointer-events-none border shadow-sm"
              :style="lensStyle"
            />
          </div>

          <div
            class="hidden lg:block w-72 rounded-lg border overflow-hidden aspect-w-1 aspect-h-1 sm:aspect-w-2 sm:aspect-h-3 lg:aspect-w-3 lg:aspect-h-4 transition-opacity"
            :class="isZoomActive ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            :style="{ ...zoomPreviewStyle, backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }"
          />
        </div>

        <!-- Thumbnails -->
        <div v-if="currentImages.length > 1" class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 max-w-2xl">
          <button
            v-for="(img, idx) in currentImages"
            :key="idx"
            class="relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
            :class="selectedImage === img ? 'border-[var(--primary-color)] opacity-100 ring-1 ring-[var(--primary-color)]' : 'border-transparent opacity-60 hover:border-[var(--border-color)]'"
            :style="{ backgroundColor: 'var(--card-bg)' }"
            @click="selectedImage = img"
          >
            <img 
              :src="img" 
              :alt="`${product.title} - view ${idx + 1}`"
              class="w-full h-full object-center object-contain p-1"
              @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Thumbnail'"
            >
          </button>
        </div>
      </div>

      <!-- Product info -->
      <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
        <h1 class="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">{{ product.title }}</h1>
        
        <div class="mt-3">
          <h2 class="sr-only">商品信息</h2>
          <p class="text-3xl text-[var(--text-color)]">¥{{ product.price }}</p>
        </div>

        <!-- Reviews -->
        <div class="mt-3">
          <h3 class="sr-only">评价</h3>
          <div class="flex items-center">
            <div class="flex items-center">
              <svg v-for="rating in [0, 1, 2, 3, 4]" :key="rating" :class="[product.rating.rate > rating ? 'text-yellow-400' : 'text-[var(--border-color)]', 'h-5 w-5 flex-shrink-0']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="sr-only">{{ product.rating.rate }} 满分 5 星</p>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="sr-only">描述</h3>
          <div 
            class="text-base text-[var(--text-secondary)] space-y-6 rich-content" 
            v-html="product.detailHtml || product.description" 
          />
        </div>
        
        <div class="mt-6 flex items-center">
          <span
            class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium capitalize border"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--primary-color), transparent 88%)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }"
          >
            {{ getCategoryLabel(product.category) }}
          </span>
        </div>

        <div v-if="user" class="mt-10 flex sm:flex-row">
          <BaseButton 
            size="lg" 
            block 
            :loading="addingToCart"
            class="flex items-center justify-center gap-2"
            @click="handleAddToCart"
          >
            <ShoppingCartIcon class="h-6 w-6" />
            加入购物车
          </BaseButton>
          
          <ClientOnly>
            <button 
              type="button" 
              class="ml-4 py-3 px-3 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-color)] transition-colors"
              :class="{ 'text-red-500 hover:text-red-600': product && isInWishlist(product.id) }"
              @click="handleToggleWishlist"
            >
              <svg class="h-6 w-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" :fill="product && isInWishlist(product.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="sr-only">加入收藏</span>
            </button>
          </ClientOnly>
        </div>
        
        <div v-else class="mt-10 flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-[var(--muted-bg)]" :style="{ borderColor: 'var(--border-color)' }">
          <p class="text-[var(--text-secondary)] mb-4">登录后即可购买商品和收藏</p>
          <BaseButton @click="openLoginModal">立即登录</BaseButton>
        </div>
        
        <div class="mt-8 border-t pt-8" :style="{ borderColor: 'var(--border-color)' }">
           <NuxtLink to="/products" class="font-medium flex items-center gap-2" :style="{ color: 'var(--primary-color)' }">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
             </svg>
             返回商品列表
           </NuxtLink>
        </div>
      </div>
    </div>
    <div v-if="historyItems.length > 0" class="mt-16 border-t pt-10" :style="{ borderColor: 'var(--border-color)' }">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-[var(--text-color)]">最近浏览</h3>
        <button 
          class="text-sm transition-colors" 
          :style="{ color: 'var(--text-secondary)' }"
          @click="clearHistory"
        >
          清空历史
        </button>
      </div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
        <div v-for="item in historyItems" :key="item.id" class="group relative">
          <div class="w-full min-h-80 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none border" :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }">
            <img 
              :src="item.image" 
              :alt="item.title" 
              class="w-full h-full object-center object-contain lg:w-full lg:h-full p-4" 
              @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image'"
            >
          </div>
          <div class="mt-4 flex justify-between">
            <div>
              <h3 class="text-sm text-[var(--text-color)]">
                <NuxtLink :to="`/products/${item.id}`">
                  <span aria-hidden="true" class="absolute inset-0" />
                  {{ item.title }}
                </NuxtLink>
              </h3>
              <p class="mt-1 text-sm text-[var(--text-secondary)] capitalize">{{ getCategoryLabel(item.category) }}</p>
            </div>
            <p class="text-sm font-medium text-[var(--text-color)]">¥{{ item.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProducts, type Product } from '~/modules/product/composables/useProducts'
import { useHistory } from '~/composables/useHistory'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const { getProductById } = useProducts()
const toast = useToast()
const { user } = useAuth()
const { addToCart } = useCart()
const { toggleWishlist, isInWishlist } = useWishlist()
const { historyItems, addToHistory, fetchHistory, clearHistory } = useHistory()
const { getCategoryLabel } = useCategoryMapper()

const id = parseInt(route.params.id as string)

const { data: product, pending } = await useAsyncData<Product | undefined>(
  `product-${id}`,
  async () => {
    if (isNaN(id)) return undefined
    return await getProductById(id)
  }
)

const error = computed(() => !pending.value && !product.value)
const selectedImage = ref(product.value?.image || '')

// Compute available images (fallback to main image if array missing)
const currentImages = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images
  }
  return [product.value.image]
})

onMounted(async () => {
  await fetchHistory()
  if (product.value) {
    if (!selectedImage.value) selectedImage.value = product.value.image
    addToHistory(product.value)
  }
})

watch(product, (newProduct) => {
  if (newProduct) {
    selectedImage.value = newProduct.image
    addToHistory(newProduct)
  }
})

useSeoMeta({
  title: () => product.value?.title || '商品详情',
  description: () => product.value?.description?.substring(0, 160) || '查看商品详情',
  ogTitle: () => product.value?.title || '商品详情 - NuxtShop',
  ogDescription: () => product.value?.description?.substring(0, 160) || '查看商品详情',
  ogImage: () => product.value?.image || '/og-image.png',
  twitterCard: 'summary_large_image',
})

const addingToCart = ref(false)
const { openLoginModal } = useLoginModal()

const handleAddToCart = () => {
  if (!product.value) return
  if (!user.value) {
    openLoginModal()
    return
  }
  
  addingToCart.value = true
  setTimeout(() => {
    if (product.value) {
      addToCart(product.value)
      toast.success(`已将 ${product.value.title} 加入购物车！`)
    }
    addingToCart.value = false
  }, 500)
}

const handleToggleWishlist = () => {
  if (!user.value) {
    openLoginModal()
    return
  }
  if (product.value) {
    toggleWishlist(product.value)
  }
}

const imageContainerRef = ref<HTMLElement | null>(null)
const isZoomActive = ref(false)
const zoomPos = ref({ xPct: 50, yPct: 50, lensLeft: 0, lensTop: 0 })

const ZOOM_SCALE = 2.6
const LENS_SIZE = 128

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const handleZoomEnter = (event: MouseEvent) => {
  isZoomActive.value = true
  handleZoomMove(event)
}

const handleZoomLeave = () => {
  isZoomActive.value = false
}

const handleZoomMove = (event: MouseEvent) => {
  if (!isZoomActive.value) return
  const el = imageContainerRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const x = clamp(event.clientX - rect.left, 0, rect.width)
  const y = clamp(event.clientY - rect.top, 0, rect.height)

  const xPct = rect.width ? (x / rect.width) * 100 : 50
  const yPct = rect.height ? (y / rect.height) * 100 : 50

  const lensLeft = clamp(x - LENS_SIZE / 2, 0, Math.max(0, rect.width - LENS_SIZE))
  const lensTop = clamp(y - LENS_SIZE / 2, 0, Math.max(0, rect.height - LENS_SIZE))

  zoomPos.value = { xPct, yPct, lensLeft, lensTop }
}

const lensStyle = computed(() => ({
  width: `${LENS_SIZE}px`,
  height: `${LENS_SIZE}px`,
  left: `${zoomPos.value.lensLeft}px`,
  top: `${zoomPos.value.lensTop}px`,
  borderRadius: 'var(--border-radius)',
  borderColor: 'var(--border-color)',
  backgroundColor: 'color-mix(in srgb, var(--card-bg), transparent 65%)'
}))

const zoomPreviewStyle = computed(() => {
  const src = selectedImage.value
  return {
    width: '100%',
    height: '100%',
    backgroundImage: src ? `url(${src})` : 'none',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${zoomPos.value.xPct}% ${zoomPos.value.yPct}%`,
    backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`
  }
})
</script>

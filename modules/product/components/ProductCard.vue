<template>
  <div
    class="group relative flex flex-col overflow-hidden cursor-pointer border bg-[var(--card-bg)] transition-all duration-300"
    :class="cardClass"
    :style="cardStyle"
  >
    <!-- Image Container -->
    <div
      class="relative aspect-[1/1] overflow-hidden bg-[var(--bg-color)]"
      :style="mediaStyle"
    >
      <div
        class="pointer-events-none absolute inset-0 z-10 translate-y-4 bg-gradient-to-t from-white/10 via-white/4 to-transparent opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
      />
      <img 
        :src="imageSrc" 
        :alt="product.title"
        :class="imageClass"
        loading="lazy"
        @error="handleImageError"
      >
      
      <!-- Top Right Action (Wishlist) -->
      <button 
        class="absolute top-3 right-3"
        :class="[iconButtonClass, wishlistButtonClass, { 'opacity-50 cursor-not-allowed': !user }]"
        :aria-label="isInWishlist(product.id) ? '移除收藏' : '加入收藏'"
        :disabled="!user"
        @click.stop="handleToggleWishlist"
      >
        <HeartIcon class="w-5 h-5 transition-colors duration-300" :class="{ 'fill-red-500 text-red-500': isInWishlist(product.id) }" />
      </button>
    </div>

    <!-- Content -->
    <div class="mt-3 flex flex-col gap-1 px-1.5 pb-2.5">
      <!-- Title -->
      <h3 class="text-sm font-medium text-[var(--text-color)] line-clamp-2 leading-tight min-h-[2.5em]">
        {{ product.title }}
      </h3>

      <!-- Tags/Badges (Optional, mimic design if needed, but keeping clean for now) -->
      
      <!-- Price and Actions Row -->
      <div class="mt-2 flex items-end justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-red-600 font-bold text-xl">
            <span class="text-sm">¥</span>{{ formatPrice(product.price) }}
          </span>
          <span class="text-xs text-[var(--text-secondary)]">销量{{ product.rating.count }}+</span>
        </div>

        <!-- Add to Cart Button -->
        <button 
          :class="[iconButtonClass, cartButtonClass, { 'opacity-50 cursor-not-allowed': !user }]"
          aria-label="加入购物车"
          :disabled="!user"
          @click.stop="handleAddToCart"
        >
          <PlusIcon class="w-5 h-5" stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
  noShadow?: boolean
}>()

const { user } = useAuth()
const { toggleWishlist, isInWishlist } = useWishlist()
const { addToCart } = useCart()
const toast = useToast()
const { openLoginModal } = useLoginModal()
const { t } = useI18n()

// Image fallback handling
const imageSrc = ref(props.product.image)

const cardStyle = {
  borderRadius: 'calc(var(--border-radius) + 2px)',
  borderColor: 'var(--border-color)'
}

const mediaStyle = {
  borderRadius: 'calc(var(--border-radius) + 2px)'
}

const cardClass = computed(() => {
  if (props.noShadow) {
    return 'shadow-none hover:shadow-none'
  }
  return 'shadow-sm hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]'
})

const imageClass = 'h-full w-full object-contain object-center p-4 transition-opacity duration-500'
const iconButtonClass = 'flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:hover:translate-y-0 disabled:hover:shadow-sm'
const wishlistButtonClass = 'border border-white/50 bg-white/72 text-[var(--text-secondary)] backdrop-blur-[2px] hover:bg-white hover:text-[var(--text-color)]'
const cartButtonClass = 'border border-[var(--primary-color)]/15 bg-[var(--primary-color)]/8 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white'

watch(() => props.product.image, (newVal) => {
  imageSrc.value = newVal
})

const handleImageError = () => {
  // Fallback to a placeholder image
  imageSrc.value = 'https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'
}

const formatPrice = (price: number) => {
  return price.toFixed(2)
}

const handleAddToCart = () => {
  if (!user.value) {
    openLoginModal()
    return
  }
  addToCart(props.product)
  toast.success(t('toast.cartAdded'))
}

const handleToggleWishlist = () => {
  if (!user.value) {
    openLoginModal()
    return
  }
  toggleWishlist(props.product)
}
</script>

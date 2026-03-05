<template>
  <div class="group relative flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300">
    <!-- Image Container -->
    <div class="relative aspect-[1/1] overflow-hidden bg-gray-100 rounded-xl">
      <img 
        :src="product.image" 
        :alt="product.title"
        class="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105 p-4"
      >
      
      <!-- Top Right Action (Wishlist) -->
      <button 
        class="absolute top-3 right-3 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 transition-colors backdrop-blur-sm"
        @click.stop="toggleWishlist(product)"
      >
        <HeartIcon class="w-5 h-5" :class="{ 'fill-red-500 text-red-500': isInWishlist(product.id) }" />
      </button>
    </div>

    <!-- Content -->
    <div class="mt-3 flex flex-col gap-1 px-1 pb-2">
      <!-- Title -->
      <h3 class="text-sm font-medium text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]">
        {{ product.title }}
      </h3>

      <!-- Tags/Badges (Optional, mimic design if needed, but keeping clean for now) -->
      
      <!-- Price and Actions Row -->
      <div class="mt-2 flex items-end justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-red-600 font-bold text-xl">
            <span class="text-sm">¥</span>{{ formatPrice(product.price) }}
          </span>
          <span class="text-xs text-gray-400">销量{{ product.rating.count }}+</span>
        </div>

        <!-- Add to Cart Button -->
        <button 
          class="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95"
          @click.stop="addToCartAndToast"
        >
          <PlusIcon class="w-5 h-5" stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Product } from '~/modules/product/composables/useProducts'

const props = defineProps<{
  product: Product
}>()

const { toggleWishlist, isInWishlist } = useWishlist()
const { addToCart } = useCart()
const toast = useToast()

const formatPrice = (price: number) => {
  return price.toFixed(2)
}

const addToCartAndToast = () => {
  addToCart(props.product)
  toast.success('已加入购物车')
}
</script>

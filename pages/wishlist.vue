<template>
  <ClientOnly>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">我的收藏</h1>
    </div>

    <div v-if="wishlistItems.length === 0" class="text-center py-12 bg-[var(--card-bg)] rounded-lg border-2 border-dashed border-[var(--border-color)]">
      <svg class="mx-auto h-12 w-12 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-[var(--text-color)]">您的收藏夹是空的</h3>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">将您喜欢的商品保存到收藏夹。</p>
      <div class="mt-6">
        <NuxtLink to="/products">
          <BaseButton variant="primary">浏览商品</BaseButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-[var(--text-secondary)]">
          共收藏 <span class="font-semibold text-[var(--text-color)]">{{ wishlistItems.length }}</span> 件商品
        </p>
        <div class="flex items-center gap-2">
          <BaseButton
            size="sm"
            variant="secondary"
            class="text-xs sm:text-sm"
            @click="handleAddAllToCart"
          >
            全部加入购物车
          </BaseButton>
          <BaseButton
            size="sm"
            variant="outline"
            class="text-xs sm:text-sm text-red-500 border-red-200 hover:bg-red-50"
            @click="handleClearWishlist"
          >
            清空收藏夹
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <NuxtLink v-for="product in wishlistItems" :key="product.id" :to="`/products/${product.id}`" class="block">
          <BaseCard class="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <div class="relative">
              <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-[var(--bg-color)] mb-4 h-48 flex items-center justify-center p-4">
                <img :src="product.image" :alt="product.title" loading="lazy" class="h-full w-full object-contain object-center group-hover:opacity-75">
              </div>
              <button 
                class="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--card-bg)] shadow-sm text-red-500 hover:bg-[var(--bg-color)] transition-colors" 
                aria-label="移除收藏"
                @click.prevent="removeFromWishlist(product.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="flex-1 flex flex-col justify-between">
              <h3 class="text-sm font-medium text-[var(--text-color)] line-clamp-2 min-h-[2.5rem]">
                {{ product.title }}
              </h3>
              <div class="mt-4 flex items-center justify-between">
                <p class="text-lg font-bold text-[var(--text-color)]">¥{{ product.price }}</p>
                <BaseButton size="sm" variant="secondary" class="flex items-center justify-center p-2" @click.prevent="handleAddToCart(product)">
                  <ShoppingCartIcon class="h-5 w-5" />
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Ad Carousel -->
    <section class="mt-8">
      <BaseAdCarousel :ads="ads" />
    </section>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useWishlist } from '~/composables/useWishlist'
import { useCart } from '~/modules/cart/composables/useCart'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import BaseAdCarousel from '~/components/ui/BaseAdCarousel.vue'

const { wishlistItems, removeFromWishlist, resetWishlistLocal } = useWishlist()
const { addToCart } = useCart()
const toast = useToast()
const { confirm } = useConfirm()

const ads = [
  { id: 1, image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80', link: '/products?category=electronics', alt: '收藏夹电子产品广告' },
  { id: 2, image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80', link: '/products?category=jewelery', alt: '收藏夹珠宝广告' }
]

useSeoMeta({
  title: '我的收藏',
  description: '查看您收藏的商品。'
})

const handleAddToCart = (product: Product) => {
  addToCart(product)
  toast.success('已加入购物车，点击右上角购物车查看')
}

const handleAddAllToCart = async () => {
  if (wishlistItems.value.length === 0) return

  const ok = await confirm({
    title: '全部加入购物车',
    message: `确定将当前 ${wishlistItems.value.length} 件收藏商品全部加入购物车吗？如有重复会自动合并数量。`,
    type: 'warning',
    confirmText: '全部加入',
    cancelText: '取消'
  })

  if (!ok) return

  wishlistItems.value.forEach((product) => {
    addToCart(product)
  })

  toast.success('已将收藏的商品加入购物车（如有重复会自动合并数量）')
}

const handleClearWishlist = async () => {
  if (wishlistItems.value.length === 0) return

  const ok = await confirm({
    title: '清空收藏夹',
    message: '确定要清空收藏夹中的所有商品吗？该操作无法撤销。',
    type: 'danger',
    confirmText: '清空',
    cancelText: '取消'
  })

  if (!ok) return

  resetWishlistLocal()
  toast.success('已清空收藏夹')
}
</script>

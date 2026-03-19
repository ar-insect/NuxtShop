<template>
  <ClientOnly>
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="border-b border-[var(--border-color)] pb-5 mb-8">
        <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">{{ t('pages.wishlist.title') }}</h1>
      </div>

      <BaseEmpty
        v-if="wishlistItems.length === 0"
        :title="t('pages.wishlist.emptyTitle')"
        :description="t('pages.wishlist.emptyDesc')"
      >
        <NuxtLink to="/products">
          <BaseButton variant="primary">{{ t('pages.wishlist.emptyButton') }}</BaseButton>
        </NuxtLink>
      </BaseEmpty>

      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ t('pages.wishlist.summary', { count: wishlistItems.length }) }}
          </p>
          <div class="flex items-center gap-2">
            <BaseButton
              size="sm"
              variant="secondary"
              class="text-xs sm:text-sm"
              @click="handleAddAllToCart"
            >
              {{ t('pages.wishlist.addAllButton') }}
            </BaseButton>
            <BaseButton
              size="sm"
              variant="outline"
              class="text-xs sm:text-sm text-red-500 border-red-200 hover:bg-red-50"
              @click="handleClearWishlist"
            >
              {{ t('pages.wishlist.clearButton') }}
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
                  :aria-label="t('pages.wishlist.removeAria')"
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
import type { AdsResponse } from '~/types/api'
import { useConfirm } from '~/composables/useConfirm'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import BaseAdCarousel from '~/components/ui/BaseAdCarousel.vue'

const { wishlistItems, removeFromWishlist, resetWishlistLocal } = useWishlist()
const { addToCart } = useCart()
const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const { data: adsData } = await useAsyncData('ads-wishlist', () =>
  $fetch<AdsResponse>('/api/ads', {
    query: { position: 'wishlist' }
  })
)

const ads = computed(() =>
  (adsData.value?.items || []).map((item) => ({
    id: item.id,
    image: item.image,
    link: item.link,
    alt: t(item.altKey)
  }))
)

useSeoMeta({
  title: () => t('seo.wishlist.title'),
  description: () => t('seo.wishlist.description')
})

const handleAddToCart = (product: Product) => {
  addToCart(product)
  toast.success(t('toast.cartAdded'))
}

const handleAddAllToCart = async () => {
  if (wishlistItems.value.length === 0) return

  const ok = await confirm({
    title: t('pages.wishlist.addAllConfirmTitle'),
    message: t('pages.wishlist.addAllConfirmMessage', { count: wishlistItems.value.length }),
    type: 'warning',
    confirmText: t('pages.wishlist.addAllConfirmConfirm'),
    cancelText: t('pages.wishlist.addAllConfirmCancel')
  })

  if (!ok) return

  wishlistItems.value.forEach((product) => {
    addToCart(product)
  })

  toast.success(t('pages.wishlist.addAllSuccess'))
}

const handleClearWishlist = async () => {
  if (wishlistItems.value.length === 0) return

  const ok = await confirm({
    title: t('pages.wishlist.clearConfirmTitle'),
    message: t('pages.wishlist.clearConfirmMessage'),
    type: 'danger',
    confirmText: t('pages.wishlist.clearConfirmConfirm'),
    cancelText: t('pages.wishlist.clearConfirmCancel')
  })

  if (!ok) return

  resetWishlistLocal()
  toast.success(t('pages.wishlist.clearSuccess'))
}
</script>

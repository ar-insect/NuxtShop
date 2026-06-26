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
          <div
            v-for="product in wishlistItems"
            :key="product.id"
            class="block"
            @click="navigateTo(`/products/${product.id}`)"
          >
            <ProductCard :product="product" />
          </div>
        </div>
      </div>

      <section class="mt-8">
        <BaseAdCarousel :ads="ads" />
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import ProductCard from '~/modules/product/components/ProductCard.vue'
import { useWishlist } from '~/composables/useWishlist'
import { useToast } from '~/composables/useToast'
import type { ApiResponse } from '~/types/common'
import type { AdItem } from '~/types/ad'
import { useConfirm } from '~/composables/useConfirm'
import BaseAdCarousel from '~/components/ui/BaseAdCarousel.vue'

const { wishlistItems, clearWishlist } = useWishlist()
const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const { data: adsData } = await useAsyncData('ads-wishlist', () =>
  $fetch<ApiResponse<{ items: AdItem[] }>>('/api/ads', {
    query: { position: 'wishlist' }
  })
)

const ads = computed(() =>
  (adsData.value?.data.items || []).map((item) => ({
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

  const { addToCart } = useCart()
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

  await clearWishlist()
  toast.success(t('pages.wishlist.clearSuccess'))
}
</script>

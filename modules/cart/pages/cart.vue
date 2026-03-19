<template>
  <ClientOnly>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">{{ t('pages.cart.title') }}</h1>
    </div>

    <BaseEmpty
      v-if="cartItems.length === 0"
      :title="t('pages.cart.emptyTitle')"
      :description="t('pages.cart.emptyDesc')"
    >
      <NuxtLink to="/products">
        <BaseButton variant="primary">{{ t('pages.cart.continueShopping') }}</BaseButton>
      </NuxtLink>
    </BaseEmpty>

    <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
      <section aria-labelledby="cart-heading" class="lg:col-span-7">
        <h2 id="cart-heading" class="sr-only">{{ t('pages.cart.itemsHeading') }}</h2>

        <ul role="list" class="border-t border-b border-[var(--border-color)] divide-y divide-[var(--border-color)]">
          <li v-for="item in cartItems" :key="item.id" class="flex py-6 sm:py-10">
            <NuxtLink :to="`/products/${item.id}`" class="flex-shrink-0">
              <img 
                :src="item.image" 
                :alt="item.title" 
                class="w-24 h-24 rounded-md object-center object-contain sm:w-48 sm:h-48 bg-[var(--bg-color)]"
              >
            </NuxtLink>

            <div class="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
              <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                <div>
                  <div class="flex justify-between">
                    <h3 class="text-sm">
                      <NuxtLink :to="`/products/${item.id}`" class="font-medium text-[var(--text-color)] hover:text-[var(--primary-color)]">
                        {{ item.title }}
                      </NuxtLink>
                    </h3>
                  </div>
                  <p class="mt-1 text-sm font-medium text-[var(--text-color)]">¥{{ item.price }}</p>
                  <p class="mt-1 text-sm text-[var(--text-secondary)]">{{ item.category }}</p>
                </div>

                <div class="mt-4 sm:mt-0 sm:pr-9">
                  <label :for="`quantity-${item.id}`" class="sr-only">
                    {{ t('pages.cart.quantityLabel', { title: item.title }) }}
                  </label>
                  <select 
                    :id="`quantity-${item.id}`" 
                    :name="`quantity-${item.id}`" 
                    :value="item.quantity"
                    class="max-w-full rounded-md border border-[var(--border-color)] bg-[var(--input-bg)] py-1.5 text-base leading-5 font-medium text-[var(--text-color)] text-left shadow-sm focus:outline-none focus:border-indigo-500 sm:text-sm"
                    @change="updateQuantity(item.id, parseInt(($event.target as HTMLSelectElement).value))"
                  >
                    <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                  </select>

                  <div class="absolute top-0 right-0">
                    <button 
                      type="button" 
                      class="-m-2 p-2 inline-flex text-[var(--text-secondary)] hover:text-red-500"
                      @click="handleRemoveItem(item.id)"
                    >
                      <span class="sr-only">{{ t('pages.cart.removeSrOnly') }}</span>
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Order summary -->
      <section aria-labelledby="summary-heading" class="mt-16 bg-[var(--card-bg)] rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5 border border-[var(--border-color)]">
        <h2 id="summary-heading" class="text-lg font-medium text-[var(--text-color)]">{{ t('pages.cart.summaryTitle') }}</h2>

        <dl class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <dt class="text-sm text-[var(--text-secondary)]">{{ t('pages.cart.subtotalLabel') }}</dt>
            <dd class="text-sm font-medium text-[var(--text-color)]">¥{{ cartTotal.toFixed(2) }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-sm text-[var(--text-secondary)]">{{ t('pages.cart.discountLabel') }}</dt>
            <dd class="text-sm font-medium text-emerald-600">¥0.00</dd>
          </div>
          <div class="border-t border-[var(--border-color)] pt-4 flex items-center justify-between">
            <dt class="text-base font-medium text-[var(--text-color)]">{{ t('pages.cart.totalLabel') }}</dt>
            <dd class="text-base font-bold text-[var(--text-color)]">¥{{ cartTotal.toFixed(2) }}</dd>
          </div>
        </dl>

        <p class="mt-3 text-xs text-[var(--text-secondary)]">
          {{ t('pages.cart.summaryHint') }}
        </p>

        <div class="mt-6">
          <BaseButton block size="lg" :disabled="cartItems.length === 0" @click="handleCheckout">
            {{ cartItems.length === 0 ? t('pages.cart.buttonEmpty') : t('pages.cart.buttonCheckout') }}
          </BaseButton>
        </div>
      </section>
    </div>

    <!-- Recommended Products -->
    <section aria-labelledby="recommended-products-heading" class="mt-16">
      <div class="flex items-end justify-between gap-4 mb-2">
        <div>
          <h2 id="recommended-products-heading" class="text-2xl font-bold text-[var(--text-color)]">{{ t('pages.cart.recommendedTitle') }}</h2>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">
            {{ t('pages.cart.recommendedDesc') }}
          </p>
        </div>
      </div>
      <div v-if="recommendedProductsPending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCardSkeleton v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="recommendedProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in recommendedProducts"
          :key="product.id"
          :product="product"
          @click="navigateTo(`/products/${product.id}`)"
        />
      </div>
      <div v-else class="text-center py-12 text-[var(--text-secondary)]">
        {{ t('pages.cart.recommendedEmpty') }}
      </div>
    </section>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import ProductCard from '~/modules/product/components/ProductCard.vue'
import ProductCardSkeleton from '~/modules/product/components/ProductCardSkeleton.vue'
import type { Product } from '~/modules/product/composables/useProducts'
import { http } from '~/utils/http'
import { useI18n } from '~/composables/useI18n'

const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

useSeoMeta({
  title: t('seo.cart.title'),
  description: t('seo.cart.description')
})

// Fetch recommended products：最近 7 天全站浏览最多的商品，再排除购物车中已有的
const { data: recommendedProductsData, pending: recommendedProductsPending } = await useAsyncData(
  'recommendedProducts',
  () =>
    http.get<{ success: boolean; items: { product: Product; views: number }[] }>(
      '/history/top-products',
      { days: 7, limit: 8 }
    ),
  {
    default: () => ({ success: true, items: [] as { product: Product; views: number }[] })
  }
)

const recommendedProducts = computed<Product[]>(() => {
  const payload = recommendedProductsData.value
  if (!payload || !payload.items) return []

  const inCartIds = new Set(cartItems.value.map((item) => item.id))

  return payload.items
    .map((i) => i.product)
    .filter((p) => !inCartIds.has(p.id))
    .slice(0, 4)
})

const handleRemoveItem = async (id: number) => {
  const isConfirmed = await confirm({
    title: t('pages.cart.removeConfirmTitle'),
    message: t('pages.cart.removeConfirmMessage'),
    type: 'warning',
    confirmText: t('pages.cart.removeConfirmConfirm'),
    cancelText: t('pages.cart.removeConfirmCancel')
  })

  if (isConfirmed) {
    removeFromCart(id)
    toast.success(t('toast.cartItemRemoved'))
  }
}

const handleCheckout = async () => {
  if (cartItems.value.length === 0) return

  const ok = await confirm({
    title: t('pages.cart.checkoutConfirmTitle'),
    message: t('pages.cart.checkoutConfirmMessage', {
      count: cartItems.value.length,
      total: cartTotal.value.toFixed(2)
    }),
    type: 'warning',
    confirmText: t('pages.cart.checkoutConfirmConfirm'),
    cancelText: t('pages.cart.checkoutConfirmCancel')
  })

  if (!ok) return

  navigateTo('/checkout')
}
</script>

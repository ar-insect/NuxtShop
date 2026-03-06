<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="border-b border-[var(--border-color)] pb-5 mb-8">
      <h1 class="text-3xl font-bold leading-tight text-[var(--text-color)]">购物车</h1>
    </div>

    <div v-if="cartItems.length === 0" class="text-center py-12 bg-[var(--card-bg)] rounded-lg border-2 border-dashed border-[var(--border-color)]">
      <svg class="mx-auto h-12 w-12 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-[var(--text-color)]">您的购物车是空的</h3>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">开始添加一些商品到您的购物车吧。</p>
      <div class="mt-6">
        <NuxtLink to="/products">
          <BaseButton variant="primary">继续购物</BaseButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
      <section aria-labelledby="cart-heading" class="lg:col-span-7">
        <h2 id="cart-heading" class="sr-only">购物车中的商品</h2>

        <ul role="list" class="border-t border-b border-[var(--border-color)] divide-y divide-[var(--border-color)]">
          <li v-for="item in cartItems" :key="item.id" class="flex py-6 sm:py-10">
            <div class="flex-shrink-0">
              <img 
                :src="item.image" 
                :alt="item.title" 
                class="w-24 h-24 rounded-md object-center object-contain sm:w-48 sm:h-48 bg-[var(--bg-color)]"
              >
            </div>

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
                  <label :for="`quantity-${item.id}`" class="sr-only">数量, {{ item.title }}</label>
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
                      <span class="sr-only">移除</span>
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
        <h2 id="summary-heading" class="text-lg font-medium text-[var(--text-color)]">订单摘要</h2>

        <dl class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <dt class="text-sm text-[var(--text-secondary)]">小计</dt>
            <dd class="text-sm font-medium text-[var(--text-color)]">¥{{ cartTotal.toFixed(2) }}</dd>
          </div>
          <div class="border-t border-[var(--border-color)] pt-4 flex items-center justify-between">
            <dt class="text-base font-medium text-[var(--text-color)]">订单总计</dt>
            <dd class="text-base font-medium text-[var(--text-color)]">¥{{ cartTotal.toFixed(2) }}</dd>
          </div>
        </dl>

        <div class="mt-6">
          <BaseButton block size="lg" @click="handleCheckout">去结算</BaseButton>
        </div>
      </section>
    </div>

    <!-- Recommended Products -->
    <section aria-labelledby="recommended-products-heading" class="mt-16">
      <h2 id="recommended-products-heading" class="text-2xl font-bold text-[var(--text-color)] mb-6">推荐商品</h2>
      <div v-if="recommendedProductsPending" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"/>
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
        没有找到推荐商品。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/modules/product/components/ProductCard.vue'
import { useProducts } from '~/modules/product/composables/useProducts'

const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
const toast = useToast()
const { confirm } = useConfirm()
const { getProducts } = useProducts()

useSeoMeta({
  title: '购物车',
  description: '查看您的购物车商品并结算。'
})

// Fetch recommended products
const { data: recommendedProductsData, pending: recommendedProductsPending } = await useAsyncData(
  'recommendedProducts',
  () => getProducts(1, 4), // Fetch first 4 products as recommendations
  {
    default: () => ({ items: [], total: 0 })
  }
)

const recommendedProducts = computed(() => recommendedProductsData.value?.items || [])

const handleRemoveItem = async (id: number) => {
  const isConfirmed = await confirm({
    title: '移除商品',
    message: '确定要从购物车移除这件商品吗？',
    type: 'warning',
    confirmText: '移除',
    cancelText: '取消'
  })

  if (isConfirmed) {
    removeFromCart(id)
    toast.success('商品已移除')
  }
}

const handleCheckout = () => {
  navigateTo('/checkout')
}
</script>
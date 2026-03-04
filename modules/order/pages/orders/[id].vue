<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"/>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !order" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">无法加载订单详情</h2>
      <p class="text-gray-500 mb-6">{{ error?.statusMessage || '订单不存在或已被删除' }}</p>
      <NuxtLink to="/orders">
        <BaseButton>返回订单列表</BaseButton>
      </NuxtLink>
    </div>

    <!-- Order Detail -->
    <div v-else>
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-gray-900">订单详情</h1>
            <span 
              class="px-3 py-1 text-sm font-medium rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-800': order.status === 'pending',
                'bg-green-100 text-green-800': order.status === 'completed',
                'bg-gray-100 text-gray-800': order.status === 'cancelled'
              }"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <p class="text-gray-500">订单号：{{ order.id }}</p>
        </div>
        <div class="mt-4 md:mt-0 flex gap-3">
          <NuxtLink to="/orders">
            <BaseButton variant="secondary">返回列表</BaseButton>
          </NuxtLink>
          <BaseButton v-if="order.status === 'pending'" variant="primary">立即支付</BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 class="font-medium text-gray-900">商品清单</h3>
            </div>
            <ul class="divide-y divide-gray-200">
              <li v-for="item in order.items" :key="item.id" class="p-6 flex gap-4">
                <div class="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden">
                  <img :src="item.image" :alt="item.title" class="w-full h-full object-contain object-center" >
                </div>
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">
                        <NuxtLink :to="`/products/${item.id}`" class="hover:text-indigo-600">
                          {{ item.title }}
                        </NuxtLink>
                      </h4>
                      <p class="mt-1 text-sm text-gray-500">{{ item.category }}</p>
                    </div>
                    <p class="text-sm font-medium text-gray-900">¥{{ item.price }}</p>
                  </div>
                  <div class="flex justify-between items-end mt-2">
                    <p class="text-sm text-gray-500">数量：x{{ item.quantity }}</p>
                    <p class="text-sm font-medium text-indigo-600">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Order Timeline (Mock) -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 class="font-medium text-gray-900">订单进度</h3>
            </div>
            <div class="p-6">
              <div class="relative pl-4 border-l-2 border-gray-200 space-y-8">
                <div class="relative">
                  <div class="absolute -left-[21px] bg-green-500 h-4 w-4 rounded-full border-2 border-white"/>
                  <p class="text-sm font-medium text-gray-900">订单创建成功</p>
                  <p class="text-xs text-gray-500">{{ new Date(order.date).toLocaleString() }}</p>
                </div>
                <div v-if="order.status === 'completed'" class="relative">
                  <div class="absolute -left-[21px] bg-green-500 h-4 w-4 rounded-full border-2 border-white"/>
                  <p class="text-sm font-medium text-gray-900">支付成功</p>
                  <p class="text-xs text-gray-500">{{ new Date(order.date).toLocaleString() }}</p>
                </div>
                <!-- More mock steps -->
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <!-- Price Summary -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 class="font-medium text-gray-900 mb-4">费用明细</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>商品总额</span>
                <span>¥{{ order.total.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>运费</span>
                <span>¥0.00</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>优惠</span>
                <span>-¥0.00</span>
              </div>
              <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>实付款</span>
                <span class="text-indigo-600">¥{{ order.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Info -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 class="font-medium text-gray-900 mb-4">收货信息</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="text-gray-400 w-16 inline-block">收货人：</span>{{ user?.name || user?.username }}</p>
              <p><span class="text-gray-400 w-16 inline-block">联系电话：</span>138****8888</p>
              <p><span class="text-gray-400 w-16 inline-block">收货地址：</span>北京市朝阳区三里屯 SOHO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const id = route.params.id

const { data: order, pending, error } = await useFetch(`/api/orders/${id}`)

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待付款',
    processing: '处理中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

useSeoMeta({
  title: order.value ? `订单详情 ${order.value.id}` : '订单详情',
})

definePageMeta({
  middleware: 'auth'
})
</script>
<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-[var(--text-color)] sm:truncate sm:text-3xl sm:tracking-tight">我的订单</h2>
      </div>
    </div>

    <div class="mt-8">
      <div v-if="orders.length === 0" class="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
        <ShoppingBagIcon class="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
        <h3 class="mt-2 text-sm font-semibold text-[var(--text-color)]">暂无订单</h3>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">您还没有购买过任何商品，快去逛逛吧！</p>
        <div class="mt-6">
          <NuxtLink to="/">
            <BaseButton>去购物</BaseButton>
          </NuxtLink>
        </div>
      </div>

      <div v-else>
        <div class="mb-4 flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
          <button
            v-for="tab in statusTabs"
            :key="tab.id"
            type="button"
            class="px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors"
            :class="statusFilter === tab.id
              ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)] font-medium'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'"
            @click="statusFilter = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.id !== 'all'" class="ml-1 text-[var(--text-secondary)]">({{ getStatusCount(tab.id) }})</span>
          </button>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
          <h3 class="mt-2 text-sm font-semibold text-[var(--text-color)]">当前状态暂无订单</h3>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">可以切换上方状态筛选，或继续浏览商品。</p>
        </div>

        <BaseCard v-else v-for="order in filteredOrders" :key="order.id" class="mb-6">
          <div class="flex items-center border-b border-[var(--border-color)] p-4 sm:p-6 bg-[var(--bg-color)]/50 rounded-t-lg">
            <dl class="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
              <div>
                <dt class="font-medium text-[var(--text-color)]">订单号</dt>
                <dd class="mt-1 text-[var(--text-secondary)]">{{ order.id }}</dd>
              </div>
              <div class="hidden sm:block">
                <dt class="font-medium text-[var(--text-color)]">下单时间</dt>
                <dd class="mt-1 text-[var(--text-secondary)]">{{ new Date(order.date).toLocaleDateString() }}</dd>
              </div>
              <div>
                <dt class="font-medium text-[var(--text-color)]">总金额</dt>
                <dd class="mt-1 font-medium text-[var(--text-color)]">¥{{ order.total.toFixed(2) }}</dd>
              </div>
            </dl>
            <div class="flex items-center justify-end lg:col-span-2 xl:col-span-3">
               <span
                 class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                 :class="getStatusBadgeClass(order.status)"
               >
                  {{ getStatusText(order.status) }}
               </span>
            </div>
          </div>

          <div class="p-4 sm:p-6">
            <ul role="list" class="divide-y divide-[var(--border-color)]">
              <li v-for="item in order.items" :key="item.id" class="flex py-6 sm:py-6">
                <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] p-2">
                  <img :src="item.image" :alt="item.title" class="h-full w-full object-contain object-center" >
                </div>
                <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div class="flex justify-between">
                        <h3 class="text-sm">
                          <NuxtLink :to="`/products/${item.id}`" class="font-medium text-[var(--text-color)] hover:text-[var(--primary-color)]">
                            {{ item.title }}
                          </NuxtLink>
                        </h3>
                      </div>
                      <div class="mt-1 flex text-sm">
                        <p class="text-[var(--text-secondary)]">{{ item.category }}</p>
                      </div>
                      <p class="mt-1 text-sm font-medium text-[var(--text-color)]">¥{{ item.price }}</p>
                    </div>

                    <div class="mt-4 sm:mt-0 sm:pr-9">
                      <div class="flex items-center justify-end">
                         <p class="text-sm text-[var(--text-secondary)]">x {{ item.quantity }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          
          <div class="border-t border-[var(--border-color)] p-4 sm:px-6 bg-[var(--bg-color)]/30 rounded-b-lg flex justify-end gap-3">
             <BaseButton :to="`/orders/${order.id}`" size="sm" variant="outline">查看详情</BaseButton>
             <BaseButton size="sm" variant="outline" @click="handleReorder(order)">再次购买</BaseButton>
             <BaseButton size="sm" variant="outline">申请售后</BaseButton>
             <BaseButton 
               size="sm" 
               variant="outline" 
               class="text-red-600 hover:bg-red-50 hover:border-red-200"
               @click="handleDeleteOrder(order.id)"
             >
               删除订单
             </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import type { Order } from '~/modules/order/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const { orders, deleteOrder } = useOrders()
const toast = useToast()
const { confirm } = useConfirm()

const statusFilter = ref<'all' | Order['status']>('all')

const statusTabs = [
  { id: 'all' as const, label: '全部' },
  { id: 'pending' as const, label: '处理中' },
  { id: 'processing' as const, label: '处理中(处理中)' },
  { id: 'shipped' as const, label: '已发货' },
  { id: 'delivered' as const, label: '已完成' },
  { id: 'cancelled' as const, label: '已取消' }
]

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

const getStatusCount = (status: Order['status']) => orders.value.filter(o => o.status === status).length

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '处理中'
    case 'processing':
      return '处理中'
    case 'shipped':
      return '已发货'
    case 'delivered':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return '处理中'
  }
}

const getStatusBadgeClass = (status: Order['status']) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'shipped':
      return 'bg-blue-100 text-blue-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

const handleReorder = (order: Order) => {
  toast.info('再次购买功能为演示占位，可在此实现一键加购逻辑')
}

const handleDeleteOrder = async (id: string) => {
  const isConfirmed = await confirm({
    title: '删除订单',
    message: '确定要删除这个订单吗？此操作无法撤销。',
    type: 'danger',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (isConfirmed) {
    await deleteOrder(id)
    toast.success('订单已删除')
  }
}
</script>

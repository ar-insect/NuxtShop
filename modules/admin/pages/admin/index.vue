<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex flex-col gap-2">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.dashboard.title') }}
      </h1>
      <p class="text-sm text-[var(--text-secondary)]">
        {{ t('admin.dashboard.subtitle') }}
      </p>
    </div>

    <ClientOnly>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <BaseCard class="p-4 flex flex-col gap-2">
          <div class="text-xs text-[var(--text-secondary)]">
            {{ t('admin.dashboard.cards.todayOrders') }}
          </div>
          <div class="text-2xl font-semibold text-[var(--text-color)]">
            {{ kpi.todayOrderCount }}
          </div>
        </BaseCard>
        <BaseCard class="p-4 flex flex-col gap-2">
          <div class="text-xs text-[var(--text-secondary)]">
            {{ t('admin.dashboard.cards.todayRevenue') }}
          </div>
          <div class="text-2xl font-semibold text-[var(--text-color)]">
            ¥{{ kpi.todayRevenue.toFixed(2) }}
          </div>
        </BaseCard>
        <BaseCard class="p-4 flex flex-col gap-2">
          <div class="text-xs text-[var(--text-secondary)]">
            {{ t('admin.dashboard.cards.todayNewUsers') }}
          </div>
          <div class="text-2xl font-semibold text-[var(--text-color)]">
            {{ kpi.todayNewUsers }}
          </div>
        </BaseCard>
        <BaseCard class="p-4 flex flex-col gap-2">
          <div class="text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>{{ t('admin.dashboard.cards.pendingOrders') }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <div class="flex flex-col">
              <span class="text-lg font-semibold text-[var(--text-color)]">
                {{ kpi.pendingShipmentCount }}
              </span>
              <span class="text-xs text-[var(--text-secondary)]">
                {{ t('admin.dashboard.cards.pendingShipment') }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-semibold text-[var(--text-color)]">
                {{ kpi.pendingCancelledCount }}
              </span>
              <span class="text-xs text-[var(--text-secondary)]">
                {{ t('admin.dashboard.cards.pendingCancelled') }}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        <BaseCard class="p-4 lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('admin.dashboard.trendTitle') }}
            </h2>
          </div>
          <AdminOrderTrendChart :data="trend" />
        </BaseCard>

        <BaseCard class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('admin.dashboard.todosTitle') }}
            </h2>
          </div>
          <ul class="space-y-3">
            <li
              v-for="item in todos"
              :key="item.id"
              class="flex items-start justify-between gap-3"
            >
              <div class="flex-1">
                <div class="text-xs font-medium text-[var(--text-color)]">
                  {{ item.title }}
                </div>
                <div class="mt-1 text-[11px] text-[var(--text-secondary)]">
                  {{ item.description }}
                </div>
              </div>
              <div v-if="item.link" class="flex-shrink-0">
                <BaseButton size="xs" variant="link" :to="item.link">
                  查看
                </BaseButton>
              </div>
            </li>
          </ul>
          <div v-if="!todos.length" class="py-4 text-center text-xs text-[var(--text-secondary)]">
            {{ t('admin.dashboard.todosEmpty') }}
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BaseCard class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('admin.dashboard.userTrendTitle') }}
            </h2>
          </div>
          <div class="space-y-1">
            <div
              v-for="item in userTrend"
              :key="item.date"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-[var(--text-secondary)]">
                {{ item.date.slice(5) }}
              </span>
              <span class="font-medium text-[var(--text-color)]">
                +{{ item.newUsers }}
              </span>
            </div>
            <div v-if="!userTrend.length" class="py-4 text-center text-xs text-[var(--text-secondary)]">
              {{ t('admin.dashboard.userTrendEmpty') }}
            </div>
          </div>
        </BaseCard>

        <BaseCard class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('admin.dashboard.topProductsTitle') }}
            </h2>
          </div>
          <ul class="space-y-2">
            <li
              v-for="item in topProducts"
              :key="item.id"
              class="flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 inline-flex justify-center text-[var(--text-secondary)]">
                  {{ item.rank }}
                </span>
                <span class="text-[var(--text-color)] line-clamp-1">
                  {{ item.title }}
                </span>
              </div>
              <div class="text-right text-[var(--text-secondary)]">
                <div>¥{{ item.totalRevenue.toFixed(2) }}</div>
                <div>×{{ item.totalQuantity }}</div>
              </div>
            </li>
            <li v-if="!topProducts.length" class="py-4 text-center text-xs text-[var(--text-secondary)]">
              {{ t('admin.dashboard.trendEmpty') }}
            </li>
          </ul>
        </BaseCard>

        <BaseCard class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('admin.dashboard.topCategoriesTitle') }}
            </h2>
          </div>
          <ul class="space-y-2">
            <li
              v-for="item in topCategories"
              :key="item.category"
              class="flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 inline-flex justify-center text-[var(--text-secondary)]">
                  {{ item.rank }}
                </span>
                <span class="text-[var(--text-color)] line-clamp-1">
                  {{ item.category }}
                </span>
              </div>
              <div class="text-right text-[var(--text-secondary)]">
                <div>¥{{ item.totalRevenue.toFixed(2) }}</div>
                <div>×{{ item.totalQuantity }}</div>
              </div>
            </li>
            <li v-if="!topCategories.length" class="py-4 text-center text-xs text-[var(--text-secondary)]">
              {{ t('admin.dashboard.trendEmpty') }}
            </li>
          </ul>
        </BaseCard>
      </div>
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">
import type { AdminDashboardOverview } from '~/types/api'
import { http } from '~/utils/http'
import AdminOrderTrendChart from '~/modules/admin/components/AdminOrderTrendChart.vue'
import { useI18n } from '~/composables/useI18n'

defineOptions({
  name: 'AdminDashboard'
})

definePageMeta({
  name: 'AdminDashboardPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const { data } = await useAsyncData(
  'admin-dashboard-overview',
  () => http.get<{ code: number; message: string; data: AdminDashboardOverview }>('/admin/dashboard/overview'),
  {
    server: false,
    lazy: true
  }
)

const overview = computed(() => data.value?.data)

const { t } = useI18n()
const kpi = computed(() => overview.value?.kpi ?? {
  todayOrderCount: 0,
  todayRevenue: 0,
  todayNewUsers: 0,
  pendingShipmentCount: 0,
  pendingCancelledCount: 0
})
const trend = computed(() => overview.value?.trend ?? [])
const userTrend = computed(() => overview.value?.userTrend ?? [])
const topProducts = computed(() => {
  const list = overview.value?.topProducts ?? []
  return list.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
})
const topCategories = computed(() => {
  const list = overview.value?.topCategories ?? []
  return list.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
})
const todos = computed(() => overview.value?.todos ?? [])
</script>

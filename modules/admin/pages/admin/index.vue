<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex flex-col gap-2">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.dashboard.title') }}
      </h1>
      <p class="text-sm text-[var(--text-secondary)]">
        {{ t('admin.dashboard.subtitle') }}
      </p>
    </div>

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

const { data, pending } = await useAsyncData(
  'admin-dashboard-overview',
  () => http.get<{ code: number; message: string; data: AdminDashboardOverview }>('/admin/dashboard/overview'),
  { server: false }
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
const todos = computed(() => overview.value?.todos ?? [])
</script>

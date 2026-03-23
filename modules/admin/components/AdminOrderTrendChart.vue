<template>
  <div class="w-full h-48">
    <div v-if="normalized.length === 0" class="flex items-center justify-center h-full text-xs text-[var(--text-secondary)]">
      {{ t('admin.dashboard.trendEmpty') }}
    </div>
    <svg
      v-else
      viewBox="0 0 100 60"
      class="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.18" />
          <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <polyline
        :points="revenueAreaPoints"
        fill="url(#revenueFill)"
        stroke="none"
      />

      <polyline
        :points="revenueLinePoints"
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="1.2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <polyline
        :points="orderLinePoints"
        fill="none"
        stroke="var(--admin-tag-success-fg)"
        stroke-width="1.2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <g v-for="point in normalized" :key="point.date">
        <circle
          :cx="point.x"
          :cy="point.orderY"
          r="1.2"
          fill="var(--admin-tag-success-fg)"
        />
        <circle
          :cx="point.x"
          :cy="point.revenueY"
          r="1"
          fill="var(--primary-color)"
        />
      </g>

      <g v-for="point in normalized" :key="point.date + '-label'">
        <text
          :x="point.x"
          y="58"
          text-anchor="middle"
          font-size="3"
          fill="var(--text-secondary)"
        >
          {{ point.date.slice(5) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminDashboardTrendPoint } from '~/types/api'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  data: AdminDashboardTrendPoint[]
}>()

const { t } = useI18n()

const normalized = computed(() => {
  if (!props.data || props.data.length === 0) return []
  const maxOrder = Math.max(...props.data.map(p => p.orderCount), 1)
  const maxRevenue = Math.max(...props.data.map(p => p.revenue), 1)
  const paddingX = 6
  const paddingTop = 6
  const paddingBottom = 12
  const width = 100 - paddingX * 2
  const height = 60 - paddingTop - paddingBottom
  const count = props.data.length
  const step = count > 1 ? width / (count - 1) : 0

  return props.data.map((p, index) => {
    const x = paddingX + step * index
    const orderRatio = p.orderCount / maxOrder
    const revenueRatio = p.revenue / maxRevenue
    const orderY = paddingTop + (1 - orderRatio) * height
    const revenueY = paddingTop + (1 - revenueRatio) * height
    return {
      date: p.date,
      x,
      orderY,
      revenueY
    }
  })
})

const revenueLinePoints = computed(() =>
  normalized.value.map(p => `${p.x},${p.revenueY}`).join(' ')
)

const orderLinePoints = computed(() =>
  normalized.value.map(p => `${p.x},${p.orderY}`).join(' ')
)

const revenueAreaPoints = computed(() => {
  if (!normalized.value.length) return ''
  const first = normalized.value[0]
  const last = normalized.value[normalized.value.length - 1]
  const baseY = 60 - 12
  const topPoints = normalized.value.map(p => `${p.x},${p.revenueY}`).join(' ')
  const bottomPoints = `${last.x},${baseY} ${first.x},${baseY}`
  return `${topPoints} ${bottomPoints}`
})
</script>

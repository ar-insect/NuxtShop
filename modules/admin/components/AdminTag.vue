<template>
  <span :class="classes">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AdminTagStatus = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'
type AdminTagSize = 'sm' | 'md'

const props = defineProps<{
  label?: string
  status?: AdminTagStatus
  size?: AdminTagSize
}>()

const classes = computed(() => {
  const base = ['inline-flex', 'items-center', 'rounded-full', 'font-medium', 'transition-colors']
  const sizeClass = props.size === 'sm' || !props.size
    ? ['px-3', 'py-0.5', 'text-xs']
    : ['px-3.5', 'py-1', 'text-sm']

  let colorClass: string[]

  switch (props.status) {
    case 'primary':
      colorClass = ['bg-[var(--primary-color)]/10', 'text-[var(--primary-color)]']
      break
    case 'success':
      colorClass = ['bg-emerald-100', 'text-emerald-700']
      break
    case 'warning':
      colorClass = ['bg-amber-100', 'text-amber-800']
      break
    case 'danger':
      colorClass = ['bg-red-100', 'text-red-700']
      break
    case 'muted':
      colorClass = ['bg-[var(--muted-bg)]', 'text-[var(--text-secondary)]']
      break
    default:
      colorClass = ['bg-[var(--card-bg)]', 'text-[var(--text-secondary)]', 'border', 'border-[var(--border-color)]']
      break
  }

  return [...base, ...sizeClass, ...colorClass].join(' ')
})
</script>


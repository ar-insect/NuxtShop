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

  const status = props.status || 'default'

  const colorClass = [
    'border',
    `border-[var(--admin-tag-${status}-border)]`,
    `bg-[var(--admin-tag-${status}-bg)]`,
    `text-[var(--admin-tag-${status}-fg)]`
  ]

  return [...base, ...sizeClass, ...colorClass].join(' ')
})
</script>

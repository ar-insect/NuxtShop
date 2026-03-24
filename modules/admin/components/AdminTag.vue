<template>
  <span :class="classes" :style="styleObject">
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
  const base = ['inline-flex', 'items-center', 'rounded-full', 'font-medium', 'transition-colors', 'border']
  const sizeClass = props.size === 'sm' || !props.size
    ? ['px-3', 'py-0.5', 'text-xs']
    : ['px-3.5', 'py-1', 'text-sm']

  return [...base, ...sizeClass].join(' ')
})

const styleObject = computed(() => {
  const status = props.status || 'default'
  return {
    borderColor: `var(--admin-tag-${status}-border)`,
    backgroundColor: `var(--admin-tag-${status}-bg)`,
    color: `var(--admin-tag-${status}-fg)`
  }
})
</script>

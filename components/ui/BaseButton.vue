<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :class="[
      'inline-flex items-center justify-center border font-medium focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant],
      block ? 'w-full' : ''
    ]"
    :style="rounded ? { borderRadius: 'var(--border-radius)' } : undefined"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot name="prefix"/>
    <slot/>
    <slot name="suffix"/>
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

type ButtonType = 'button' | 'submit' | 'reset'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'

interface Props {
  type?: ButtonType
  size?: ButtonSize
  variant?: ButtonVariant
  block?: boolean
  loading?: boolean
  disabled?: boolean
  rounded?: boolean
  to?: RouteLocationRaw
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  size: 'md',
  variant: 'primary',
  block: false,
  loading: false,
  disabled: false,
  rounded: true,
  to: undefined
})

defineEmits(['click'])

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm leading-4',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent text-white bg-[var(--primary-color)] hover:brightness-90 shadow-sm',
  secondary: 'border-transparent text-[var(--primary-color)] bg-gray-100 hover:bg-gray-200',
  outline: 'border-[var(--primary-color)] text-[var(--primary-color)] bg-white hover:bg-gray-50 shadow-sm',
  danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 shadow-sm',
  success: 'border-transparent text-white bg-green-600 hover:bg-green-700 shadow-sm',
  ghost: 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
}
</script>

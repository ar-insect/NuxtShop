<template>
  <div 
    class="overflow-hidden shadow divide-y transition-colors duration-200" 
    :style="{ 
      borderRadius: 'var(--border-radius)',
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-color)'
    }"
  >
    <div v-if="$slots.header || title" class="px-4 py-5 sm:px-6" :style="{ borderColor: 'var(--border-color)' }">
      <slot name="header">
        <h3 class="text-lg leading-6 font-medium" :style="{ color: 'var(--text-color)' }">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-1 max-w-2xl text-sm" :style="{ color: 'var(--text-secondary)' }">
          {{ subtitle }}
        </p>
      </slot>
    </div>
    <div class="px-4 py-5 sm:p-6">
      <slot/>
    </div>
    <div v-if="$slots.footer" class="px-4 py-4 sm:px-6 transition-colors duration-200" :style="{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-color)' }">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>

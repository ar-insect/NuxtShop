<template>
  <section
    class="flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 lg:px-8"
    :aria-label="ariaLabel || title"
    :role="status ? 'status' : undefined"
    :aria-live="live || undefined"
  >
    <div v-if="icon" class="mb-4 text-4xl" aria-hidden="true">
      <slot name="icon">
        <span>{{ icon }}</span>
      </slot>
    </div>
    <h2 v-if="title" class="text-base font-semibold text-[var(--text-color)]">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-2 text-sm max-w-md text-[var(--text-secondary)]"
    >
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
  ariaLabel?: string
  status?: boolean
  live?: 'polite' | 'assertive' | ''
}

withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: '',
  ariaLabel: '',
  status: false,
  live: ''
})
</script>

<template>
  <section 
    class="relative overflow-hidden rounded-2xl border px-6 py-12 sm:px-12 sm:py-16 lg:py-20"
    :style="{ 
      borderColor: 'var(--primary-color)',
      backgroundColor: 'var(--card-bg)'
    }"
  >
    <!-- Background Pattern -->
    <div
class="absolute inset-0 opacity-10" :style="{ 
      backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`,
      backgroundSize: '24px 24px' 
    }"/>
    
    <!-- Gradient Overlay -->
    <div
class="absolute inset-0 opacity-20" :style="{ 
      background: `linear-gradient(to right, var(--primary-color), transparent)` 
    }"/>

    <div class="relative mx-auto max-w-2xl text-center z-10">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: 'var(--text-color)' }">
        {{ t('pages.home.newsletterTitle') }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-lg" :style="{ color: 'var(--text-secondary)' }">
        {{ t('pages.home.newsletterDescription') }}
      </p>
      
      <form class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" @submit.prevent="handleSubmit">
        <input
          v-model="email"
          type="email"
          required
          :placeholder="t('pages.home.newsletterPlaceholder')"
          class="w-full rounded-md border px-5 py-3 text-base outline-none transition-all sm:max-w-xs"
          :style="{ 
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-color)'
          }"
        >
        <button
          type="submit"
          class="inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-base font-medium text-white shadow hover:opacity-90 focus:outline-none sm:w-auto transition-opacity"
          :style="{ 
            backgroundColor: 'var(--primary-color)'
          }"
        >
          {{ t('pages.home.newsletterButton') }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const email = ref('')
const emit = defineEmits(['subscribe'])
const { t } = useI18n()

const handleSubmit = () => {
  if (email.value) {
    emit('subscribe', email.value)
    email.value = ''
  }
}
</script>

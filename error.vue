<template>
  <NuxtLayout>
    <div class="min-h-screen bg-[var(--bg-color)] flex items-center justify-center px-4 py-16">
      <div class="max-w-2xl w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xl px-8 py-10 flex flex-col md:flex-row gap-8">
        <div class="flex-shrink-0 flex items-center justify-center md:border-r md:border-[var(--border-color)] md:pr-8">
          <div class="h-20 w-20 rounded-full flex items-center justify-center bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-3xl font-bold">
            {{ statusCode }}
          </div>
        </div>
        <div class="flex-1 space-y-4 text-left">
          <h1 class="text-2xl md:text-3xl font-semibold text-[var(--text-color)]">
            {{ errorMessage }}
          </h1>
          <p class="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            {{ t('pages.error.statusLabel') }} {{ statusCode }}
          </p>
          <p class="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
            {{ errorDescription }}
          </p>
          <div class="flex flex-wrap gap-3 pt-4">
            <NuxtLink to="/">
              <BaseButton variant="primary">
                {{ t('pages.error.homeButton') }}
              </BaseButton>
            </NuxtLink>
            <BaseButton variant="outline" @click="handleClearError">
              {{ t('pages.error.refreshButton') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  error: {
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    description?: string;
    data?: any;
  };
}>()

const { t } = useI18n()

const statusCode = computed(() => props.error.statusCode || 500)

const errorMessage = computed(() => {
  if (statusCode.value === 404) {
    return t('pages.error.title404')
  }
  if (statusCode.value === 500) {
    return t('pages.error.title500')
  }
  return props.error.statusMessage || t('pages.error.title')
})

const errorDescription = computed(() => {
  if (statusCode.value === 404) {
    return t('pages.error.description404')
  }
  if (statusCode.value === 500) {
    return t('pages.error.description500')
  }
  return props.error.message || t('pages.error.descriptionDefault')
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}
</script>

<style scoped></style>

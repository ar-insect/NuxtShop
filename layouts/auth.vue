<template>
  <div
    class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative"
    :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }"
  >
    <div class="absolute top-4 left-4">
      <NuxtLink to="/" class="flex items-center transition-colors hover:text-[var(--primary-color)]" :style="{ color: 'var(--text-secondary)' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        {{ t('auth.backHome') }}
      </NuxtLink>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold">
        NuxtShop
      </h2>
      <p class="mt-2 text-center text-sm" :style="{ color: 'var(--text-secondary)' }">
        {{ t('auth.authTitle') }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="py-8 px-4 shadow sm:rounded-lg sm:px-10 border"
        :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }"
      >
        <slot />
      </div>
    </div>
    
    <BaseToast />
    <BaseModal />
  </div>
</template>

<script setup lang="ts">
import BaseToast from '~/components/ui/BaseToast.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

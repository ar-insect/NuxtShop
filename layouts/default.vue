<template>
  <div
    class="min-h-screen flex flex-col font-sans"
    :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }"
  >
    <AppHeader />
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <footer class="border-t py-6 mt-12" :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }">
      <div class="container mx-auto px-4 text-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between" :style="{ color: 'var(--text-secondary)' }">
        <div class="text-center md:text-left">
          <p class="mb-1">&copy; {{ new Date().getFullYear() }} NuxtShop</p>
          <p>{{ t('footer.mit') }}</p>
        </div>
        <div class="flex justify-center md:justify-end gap-4 mt-2 md:mt-0">
          <a
            href="https://github.com/ar-insect/NuxtShop"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[var(--primary-color)] transition-colors"
          >
            {{ t('footer.repo') }}
          </a>
          <a
            href="https://github.com/ar-insect/NuxtShop/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[var(--primary-color)] transition-colors"
          >
            {{ t('footer.issues') }}
          </a>
        </div>
      </div>
    </footer>

    <BaseToast />
    <BaseModal />
    <BaseConfirm />
  </div>
</template>

<script setup lang="ts">
import BaseConfirm from '~/components/ui/BaseConfirm.vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

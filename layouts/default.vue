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
      <div class="container mx-auto px-4 text-center text-sm" :style="{ color: 'var(--text-secondary)' }">
        <p>&copy; {{ new Date().getFullYear() }} NuxtShop。基于 Nuxt 3 & Tailwind CSS 构建。</p>
      </div>
    </footer>

    <BaseToast />
    <BaseModal />
    <BaseConfirm />
  </div>
</template>

<script setup lang="ts">
import BaseConfirm from '~/components/ui/BaseConfirm.vue'
</script>

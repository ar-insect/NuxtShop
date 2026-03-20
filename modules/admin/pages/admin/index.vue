<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        Admin Dashboard
      </h1>
      <p class="mt-2 text-[var(--text-secondary)]">
        Only administrator accounts can access this page.
      </p>
    </div>

    <BaseCard class="p-6">
      <p class="text-[var(--text-secondary)]">
        This is a placeholder for the future admin management module. You can add
        user management, content configuration or other admin tools here.
      </p>
    </BaseCard>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  name: 'AdminDashboardPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


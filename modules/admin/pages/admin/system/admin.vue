<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      管理员账号管理
    </h1>
    <BaseCard class="p-6">
      <p class="text-[var(--text-secondary)]">
        这里将用于管理管理员账号，例如新增管理员、重置密码等，目前为占位页面。
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'AdminSystemAdminPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      商品分类管理
    </h1>
    <BaseCard class="p-6">
      <p class="text-[var(--text-secondary)]">
        这里将展示商品分类列表及新增/编辑分类的操作，目前为占位页面。
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'AdminGoodsCategoryPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


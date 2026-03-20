<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      编辑商品
    </h1>
    <BaseCard class="p-6">
      <p class="text-[var(--text-secondary)] mb-4">
        这里将实现根据商品 ID 编辑商品的表单，目前为占位页面。
      </p>
      <BaseButton to="/admin/goods" variant="ghost">
        返回商品列表
      </BaseButton>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'AdminGoodsEditPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


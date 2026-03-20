<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      优惠券管理
    </h1>
    <BaseCard class="p-6">
      <p class="text-[var(--text-secondary)]">
        这里将实现优惠券列表、创建与配置等功能，目前为占位页面。
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'AdminCouponPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      订单详情
    </h1>
    <BaseCard class="p-6 space-y-2">
      <p class="text-[var(--text-secondary)]">
        这里将展示订单详细信息，以及发货、退款审核等操作，目前为占位页面。
      </p>
      <BaseButton to="/admin/order" variant="ghost">
        返回订单列表
      </BaseButton>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'AdminOrderDetailPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})
</script>


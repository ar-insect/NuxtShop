<template>
  <div
    class="group relative flex flex-col overflow-hidden cursor-pointer border bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
    :style="cardStyle"
  >
    <div
      class="relative aspect-[1/1] overflow-hidden bg-[var(--bg-color)] animate-pulse"
      :style="mediaStyle"
    >
      <div class="h-full w-full bg-gray-200" />
    </div>
    <div class="mt-3 flex flex-col gap-2 px-1.5 pb-2.5">
      <div class="h-4 bg-gray-200 rounded w-11/12 animate-pulse" />
      <div class="h-4 bg-gray-100 rounded w-9/12 animate-pulse" />
      <div class="mt-2 flex items-center justify-between">
        <div class="h-5 bg-gray-200 rounded w-4/12 animate-pulse" />
        <div class="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cardStyle = {
  borderRadius: 'calc(var(--border-radius) + 2px)',
  borderColor: 'var(--border-color)'
}

const mediaStyle = {
  borderRadius: 'calc(var(--border-radius) + 2px)'
}
</script>

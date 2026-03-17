<template>
  <div
    class="group relative flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--border-color)]"
  >
    <div class="relative aspect-[1/1] overflow-hidden bg-gray-100 rounded-xl animate-pulse">
      <div class="h-full w-full bg-gray-200" />
    </div>
    <div class="mt-3 flex flex-col gap-2 px-1 pb-2">
      <div class="h-4 bg-gray-200 rounded w-11/12 animate-pulse" />
      <div class="h-4 bg-gray-100 rounded w-9/12 animate-pulse" />
      <div class="mt-2 flex items-center justify-between">
        <div class="h-5 bg-gray-200 rounded w-4/12 animate-pulse" />
        <div class="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
</template>

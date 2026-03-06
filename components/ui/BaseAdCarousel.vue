<template>
  <BaseCarousel :items="ads" class="rounded-lg overflow-hidden" indicators controls autoplay>
    <template #default="{ item }">
      <NuxtLink :to="item.link" target="_blank" rel="noopener noreferrer" class="block w-full h-full">
        <img 
          :src="item.image" 
          :alt="item.alt" 
          class="w-full h-full object-cover object-center"
        >
      </NuxtLink>
    </template>
  </BaseCarousel>
</template>

<script setup lang="ts">
import BaseCarousel from './BaseCarousel.vue'

interface Ad {
  id: number;
  image: string;
  link: string;
  alt: string;
}

defineProps<{
  ads: Ad[];
}>();
</script>
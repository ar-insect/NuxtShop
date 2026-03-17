<template>
  <div class="relative w-full overflow-hidden" @mouseenter="pause" @mouseleave="resume">
    <!-- Slides -->
    <div 
      class="flex transition-transform duration-500 ease-in-out h-full"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div 
        v-for="(slide, index) in items" 
        :key="index"
        class="w-full flex-shrink-0"
      >
        <slot :item="slide" :index="index">
          <!-- Default content if no slot provided -->
          <img 
            :src="slide.image" 
            :alt="slide.title || t('ui.carousel.goTo', { index: index + 1 })" 
            class="w-full h-full object-cover"
          >
        </slot>
      </div>
    </div>

    <!-- Indicators -->
    <div v-if="indicators" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
      <button
        v-for="(_, index) in items"
        :key="index"
        type="button"
        class="w-2.5 h-2.5 rounded-full transition-colors focus:outline-none"
        :class="currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
        :aria-label="t('ui.carousel.goTo', { index: index + 1 })"
        @click="goTo(index)"
      />
    </div>

    <!-- Controls -->
    <template v-if="controls">
      <button 
        class="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none transition-colors"
        :aria-label="t('ui.carousel.prev')"
        @click="prev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        class="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none transition-colors"
        :aria-label="t('ui.carousel.next')"
        @click="next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  items: any[]
  interval?: number
  indicators?: boolean
  controls?: boolean
  autoplay?: boolean
}>()

const { t } = useI18n()

const currentIndex = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
}

const goTo = (index: number) => {
  currentIndex.value = index
}

const startAutoplay = () => {
  if (props.autoplay && !timer.value) {
    timer.value = setInterval(next, props.interval || 3000)
  }
}

const stopAutoplay = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const pause = () => stopAutoplay()
const resume = () => startAutoplay()

watch(() => props.autoplay, (val) => {
  if (val) startAutoplay()
  else stopAutoplay()
})

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

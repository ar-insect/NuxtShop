<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-[var(--text-color)]">商品分类</h2>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">从分类开始，快速找到你想要的商品</p>
      </div>
      <button 
        class="hidden sm:flex items-center text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] transition-colors"
        @click="goToProducts()"
      >
        查看全部
        <ArrowRightIcon class="ml-1 h-4 w-4" />
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="category in categories" 
        :key="category.key"
        class="group relative h-64 overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
        @click="goToProducts({ category: category.key })"
      >
        <!-- Background Image with Zoom Effect -->
        <div class="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            :src="category.image" 
            :alt="category.label"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'"
          >
        </div>

        <!-- Overlay Gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 opacity-70 group-hover:opacity-90"/>

        <!-- Content -->
        <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div class="transform transition-transform duration-300 group-hover:-translate-y-2">
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-inner">
                <SvgIcon :name="category.icon" class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-xl font-bold tracking-wide">{{ category.label }}</h3>
            </div>
            
            <p class="text-sm text-gray-200 line-clamp-2 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 delay-75 mb-2 overflow-hidden">
              {{ category.description }}
            </p>
            
            <div class="flex items-center text-sm font-medium text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 translate-y-4 group-hover:translate-y-0">
              <span class="text-white">浏览商品</span>
              <ArrowRightIcon class="ml-2 h-4 w-4 text-white" />
            </div>
          </div>
          
          <!-- Item Count Badge -->
          <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 shadow-sm group-hover:bg-[var(--primary-color)]/80 group-hover:border-transparent transition-colors duration-300">
            {{ category.count }} 件商品
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import SvgIcon from '~/components/ui/SvgIcon.vue'

defineProps<{
  categories: any[]
}>()

const emit = defineEmits(['navigate'])

const goToProducts = (query?: any) => {
  emit('navigate', query)
}
</script>

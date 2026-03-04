<template>
  <div ref="containerRef" class="relative w-full">
    <BaseInput
      v-model="query"
      :placeholder="placeholder"
      :clearable="true"
      @update:model-value="handleInput"
      @clear="handleClear"
      @keydown.down.prevent="navigateResults(1)"
      @keydown.up.prevent="navigateResults(-1)"
      @keydown.enter.prevent="selectActive"
      @focus="showResults = true"
    >
      <template #prefix>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :style="{ color: 'var(--text-secondary)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </template>
    </BaseInput>

    <!-- Autocomplete Results -->
    <div 
      v-if="showResults && (filteredProducts.length > 0 || loading)"
      class="absolute z-50 w-full mt-1 shadow-lg max-h-96 overflow-y-auto border"
      :style="{ borderRadius: 'var(--border-radius)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }"
    >
      <div v-if="loading" class="p-4 text-center" :style="{ color: 'var(--text-secondary)' }">
        <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"/>
        搜索中...
      </div>
      
      <ul v-else class="py-1">
        <li 
          v-for="(product, index) in filteredProducts" 
          :key="product.id"
          class="autocomplete-item px-4 py-3 cursor-pointer transition-colors flex items-center gap-3"
          :class="{ 'is-active': activeIndex === index }"
          @click="selectProduct(product)"
          @mouseenter="activeIndex = index"
        >
          <img :src="product.image" :alt="product.title" class="w-10 h-10 object-contain rounded p-1 border" :style="{ backgroundColor: 'var(--muted-bg)', borderColor: 'var(--border-color)' }">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate" :style="{ color: 'var(--text-color)' }" v-html="highlightMatch(product.title)"/>
            <div class="text-xs truncate" :style="{ color: 'var(--text-secondary)' }">{{ getCategoryLabel(product.category) }}</div>
          </div>
          <div class="text-sm font-semibold" :style="{ color: 'var(--text-color)' }">¥{{ product.price }}</div>
        </li>
      </ul>
    </div>
    
    <!-- No Results State -->
    <div 
      v-if="showResults && query && filteredProducts.length === 0 && !loading"
      class="absolute z-50 w-full mt-1 shadow-lg p-4 text-center text-sm border"
      :style="{ borderRadius: 'var(--border-radius)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }"
    >
      未找到相关商品
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import type { Product } from '~/modules/product/composables/useProducts'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string
  products: Product[]
  placeholder?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', product: Product): void
  (e: 'search', query: string): void
}>()

const { getCategoryLabel } = useCategoryMapper()
const query = ref(props.modelValue)
const showResults = ref(false)
const activeIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)

// Sync internal query with prop
watch(() => props.modelValue, (newVal) => {
  query.value = newVal
})

// Filter logic
const filteredProducts = computed(() => {
  if (!query.value) return []
  
  const lowerQuery = query.value.toLowerCase().trim()
  return (props.products || []).filter(p => 
    p.title.toLowerCase().includes(lowerQuery) || 
    p.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 8) // Limit to 8 results
})

const selectProduct = (product: Product) => {
  query.value = product.title
  emit('update:modelValue', product.title)
  emit('select', product)
  showResults.value = false
}

const selectActive = () => {
  if (activeIndex.value >= 0 && filteredProducts.value[activeIndex.value]) {
    selectProduct(filteredProducts.value[activeIndex.value])
  } else {
    // If no active item, just trigger search with current query (close autocomplete)
    showResults.value = false
  }
}

// Highlight matching text
const highlightMatch = (text: string) => {
  if (!query.value) return text
  const regex = new RegExp(`(${query.value})`, 'gi')
  return text.replace(regex, '<span class="text-[var(--primary-color)] font-bold">$1</span>')
}

// Input handlers
const handleInput = (value: string) => {
  query.value = value
  emit('update:modelValue', value)
  emit('search', value)
  showResults.value = true
  activeIndex.value = -1
}

const handleClear = () => {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  showResults.value = false
}

// Navigation
const navigateResults = (step: number) => {
  if (!showResults.value || filteredProducts.value.length === 0) return
  
  const count = filteredProducts.value.length
  activeIndex.value = (activeIndex.value + step + count) % count
}

// Click outside to close

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.autocomplete-item:hover {
  background-color: var(--hover-bg);
}

.autocomplete-item.is-active {
  background-color: var(--hover-bg);
}
</style>

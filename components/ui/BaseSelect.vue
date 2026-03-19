<template>
  <div ref="containerRef" class="relative w-full">
    <label v-if="label" class="block text-sm font-medium text-[var(--text-color)] mb-1">
      {{ label }}
    </label>
    
    <div 
      class="relative w-full border rounded-md shadow-sm bg-[var(--input-bg)] transition-colors min-h-[38px] cursor-pointer flex items-center flex-wrap gap-1 px-3 py-1.5"
      :class="[
        disabled ? 'opacity-50 cursor-not-allowed bg-[var(--muted-bg)]' : '',
        isOpen ? 'border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]' : 'border-[var(--border-color)]'
      ]"
      role="button"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-disabled="disabled ? 'true' : undefined"
      tabindex="0"
      @click="toggleDropdown"
      @keydown.enter.prevent="handleTriggerKey('enter')"
      @keydown.space.prevent="handleTriggerKey('space')"
      @keydown.arrow-down.prevent="handleTriggerKey('down')"
      @keydown.arrow-up.prevent="handleTriggerKey('up')"
      @keydown.escape.prevent="handleTriggerKey('escape')"
    >
      <!-- Multi-select Tags -->
      <template v-if="multiple && Array.isArray(modelValue) && modelValue.length > 0">
        <span 
          v-for="val in modelValue" 
          :key="val"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--primary-color)]/10 text-[var(--primary-color)] mr-1"
        >
          {{ getLabel(val) }}
          <span 
            v-if="!disabled"
            class="ml-1 cursor-pointer hover:text-[var(--text-color)]"
            @click.stop="removeValue(val)"
          >
            &times;
          </span>
        </span>
      </template>
      
      <!-- Single Select Value -->
      <span v-else-if="!multiple && modelValue" class="block truncate text-sm text-[var(--text-color)]">
        {{ getLabel(modelValue as string | number) }}
      </span>

      <!-- Placeholder -->
      <span v-if="isEmpty" class="block truncate text-sm text-gray-400">
        {{ placeholder }}
      </span>

      <!-- Icons -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        <button 
          v-if="clearable && !isEmpty && !disabled"
          type="button"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
          @click.stop="clear"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg 
          class="h-5 w-5 text-gray-400 pointer-events-none transition-transform duration-200" 
          :class="{ 'rotate-180': isOpen }"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div 
      v-if="isOpen" 
      ref="listboxRef"
      class="absolute z-10 mt-1 w-full bg-[var(--card-bg)] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 overflow-auto focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700"
      role="listbox"
      tabindex="-1"
    >
      <div 
        v-for="(option, index) in options" 
        :key="option.value"
        class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-[var(--hover-bg)] text-[var(--text-color)]"
        :class="[
          isSelected(option.value) ? 'bg-[var(--primary-color)]/5 font-medium' : '',
          highlightedIndex === index ? 'bg-[var(--hover-bg)]' : ''
        ]"
        role="option"
        :aria-selected="isSelected(option.value)"
        @click="selectOption(option)"
      >
        <span class="block truncate" :class="{ 'font-semibold': isSelected(option.value) }">
          {{ option.label }}
        </span>

        <span 
          v-if="isSelected(option.value)" 
          class="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--primary-color)]"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
      <div v-if="options.length === 0" class="py-2 px-3 text-sm text-gray-500 text-center">
        暂无选项
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  label: string
  value: string | number
  [key: string]: any
}

const props = defineProps<{
  modelValue: string | number | (string | number)[] | null | undefined
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  multiple?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change', 'clear'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const highlightedIndex = ref<number>(-1)

const isEmpty = computed(() => {
  if (props.multiple) {
    return !props.modelValue || (Array.isArray(props.modelValue) && props.modelValue.length === 0)
  }
  return props.modelValue === null || props.modelValue === undefined || props.modelValue === ''
})

const getLabel = (value: string | number) => {
  const option = props.options.find(opt => opt.value === value)
  return option ? option.label : value
}

const isSelected = (value: string | number) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value)
  }
  return props.modelValue === value
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    highlightedIndex.value = getInitialHighlightIndex()
    nextTickAlignHighlight()
  }
}

const selectOption = (option: Option) => {
  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(option.value)
    
    if (index === -1) {
      currentValues.push(option.value)
    } else {
      currentValues.splice(index, 1)
    }
    
    emit('update:modelValue', currentValues)
    emit('change', currentValues)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isOpen.value = false
  }
}

const removeValue = (value: string | number) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const currentValues = props.modelValue.filter(v => v !== value)
    emit('update:modelValue', currentValues)
    emit('change', currentValues)
  }
}

const clear = () => {
  const newValue = props.multiple ? [] : null
  emit('update:modelValue', newValue)
  emit('change', newValue)
  emit('clear')
}

const getInitialHighlightIndex = () => {
  if (!props.options.length) return -1
  if (!props.multiple && props.modelValue != null && props.modelValue !== '') {
    const index = props.options.findIndex(opt => opt.value === props.modelValue)
    if (index !== -1) return index
  }
  return 0
}

const moveHighlight = (direction: 'up' | 'down') => {
  if (!props.options.length) return
  if (highlightedIndex.value === -1) {
    highlightedIndex.value = getInitialHighlightIndex()
  } else {
    const max = props.options.length - 1
    if (direction === 'down') {
      highlightedIndex.value = highlightedIndex.value >= max ? 0 : highlightedIndex.value + 1
    } else {
      highlightedIndex.value = highlightedIndex.value <= 0 ? max : highlightedIndex.value - 1
    }
  }
  nextTickAlignHighlight()
}

const nextTickAlignHighlight = () => {
  if (!listboxRef.value || highlightedIndex.value < 0) return
  const optionEl = listboxRef.value.children.item(highlightedIndex.value) as HTMLElement | null
  optionEl?.scrollIntoView({ block: 'nearest' })
}

const handleTriggerKey = (key: 'enter' | 'space' | 'down' | 'up' | 'escape') => {
  if (props.disabled) return
  if (key === 'escape') {
    isOpen.value = false
    return
  }
  if (!isOpen.value && (key === 'enter' || key === 'space' || key === 'down' || key === 'up')) {
    isOpen.value = true
    highlightedIndex.value = getInitialHighlightIndex()
    nextTickAlignHighlight()
    return
  }
  if (isOpen.value) {
    if (key === 'down' || key === 'up') {
      moveHighlight(key)
    } else if (key === 'enter' || key === 'space') {
      if (highlightedIndex.value >= 0 && highlightedIndex.value < props.options.length) {
        selectOption(props.options[highlightedIndex.value])
      }
    }
  }
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  toggleDropdown,
  clear,
  selectOption
})
</script>

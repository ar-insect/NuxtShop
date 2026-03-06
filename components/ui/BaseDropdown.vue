<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <div @click="toggleDropdown" class="cursor-pointer">
      <slot name="trigger" :is-open="isOpen">
        <button
          type="button"
          class="inline-flex justify-center w-full rounded-md border border-[var(--border-color)] shadow-sm px-4 py-2 bg-[var(--card-bg)] text-sm font-medium text-[var(--text-color)] hover:bg-[var(--hover-bg)] focus:outline-none"
          :class="{ 'border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]': isOpen }"
        >
          {{ label }}
          <svg 
            class="-mr-1 ml-2 h-5 w-5 transition-transform duration-200" 
            :class="{ 'rotate-180': isOpen }"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </slot>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--card-bg)] ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-[var(--border-color)]"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
        @click="handleMenuClick"
      >
        <div class="py-1" role="none">
          <slot :close="close" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  label?: string
  closeOnClick?: boolean
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close()
  }
}

const handleMenuClick = (event: MouseEvent) => {
  if (props.closeOnClick !== false) {
    const target = event.target as HTMLElement
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
      close()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  open: () => isOpen.value = true,
  close,
  toggle: toggleDropdown
})
</script>

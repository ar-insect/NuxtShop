<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium mb-1" :style="{ color: 'var(--text-color)' }">
      {{ label }}
    </label>
    <div class="relative shadow-sm" :style="{ borderRadius: 'var(--border-radius)' }">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix"/>
      </div>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        class="focus:outline-none focus:border-[var(--primary-color)] block w-full sm:text-sm border py-2 transition-colors"
        :class="[
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' : '',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          $slots.prefix ? 'pl-10' : 'pl-3',
          $slots.suffix ? 'pr-10' : 'pr-3'
        ]"
        :style="{ 
          borderRadius: 'var(--border-radius)',
          backgroundColor: disabled ? 'rgba(0,0,0,0.05)' : 'var(--input-bg)',
          borderColor: error ? '' : 'var(--border-color)',
          color: 'var(--text-color)'
        }"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <div v-if="$slots.suffix || (clearable && modelValue)" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button 
          v-if="clearable && modelValue" 
          type="button"
          class="focus:outline-none mr-1 hover:opacity-75 transition-opacity"
          :style="{ color: 'var(--text-secondary)' }"
          @click="clearInput"
        >
          <span class="sr-only">清除</span>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <slot name="suffix"/>
      </div>
      <div v-if="error && !$slots.suffix && !clearable" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-description`" class="mt-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  id?: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  label: '',
  id: '',
  placeholder: '',
  error: '',
  hint: '',
  disabled: false,
  clearable: false
})

const uid = useId()
const inputId = computed(() => props.id || uid)

const emit = defineEmits(['update:modelValue', 'clear'])

const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

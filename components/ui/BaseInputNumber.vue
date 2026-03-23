<template>
  <BaseInput
    :id="id"
    :label="label"
    type="text"
    :placeholder="placeholder"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :clearable="clearable"
    :required="required"
    :model-value="displayValue"
    inputmode="decimal"
    :class="alignmentClass"
    @update:modelValue="onInput"
    @blur="onBlur"
  >
    <template #prefix>
      <button
        type="button"
        class="h-6 w-6 flex items-center justify-center rounded border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] bg-[var(--input-bg)]"
        @click.stop.prevent="stepDown"
      >
        -
      </button>
      <slot name="prefix" />
    </template>
    <template #suffix>
      <slot name="suffix" />
      <button
        type="button"
        class="h-6 w-6 flex items-center justify-center rounded border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] bg-[var(--input-bg)]"
        @click.stop.prevent="stepUp"
      >
        +
      </button>
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import BaseInput from '~/components/ui/BaseInput.vue'

interface Props {
  modelValue?: number | null
  label?: string
  id?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  clearable?: boolean
  required?: boolean
  min?: number
  max?: number
  align?: 'left' | 'center' | 'right'
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  id: '',
  placeholder: '',
  error: '',
  hint: '',
  disabled: false,
  clearable: false,
  required: false,
  min: 0,
  max: Number.POSITIVE_INFINITY,
  align: 'center',
  step: 1
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const innerValue = ref<string>('')

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val === null || val === undefined ? '' : String(val)
  },
  { immediate: true }
)

const displayValue = computed(() => innerValue.value)

const alignmentClass = computed(() => {
  if (props.align === 'left') return 'text-left'
  if (props.align === 'right') return 'text-right'
  return 'text-center'
})

const onInput = (val: string | number) => {
  innerValue.value = String(val)
}

const onBlur = () => {
  let raw = innerValue.value.trim()

  // 去除非数字和小数点字符
  raw = raw.replace(/[^0-9.]/g, '')

  // 只保留第一个小数点，其余移除
  const firstDot = raw.indexOf('.')
  if (firstDot !== -1) {
    const before = raw.slice(0, firstDot + 1)
    const after = raw.slice(firstDot + 1).replace(/\./g, '')
    raw = before + after
  }

  // 处理以小数点开头的情况，例如 ".5" -> "0.5"
  if (raw.startsWith('.')) {
    raw = `0${raw}`
  }

  innerValue.value = raw

  if (!raw) {
    emit('update:modelValue', null)
    return
  }

  let num = Number(raw)
  if (Number.isNaN(num)) {
    emit('update:modelValue', null)
    return
  }
  if (num < props.min) num = props.min
  if (num > props.max) num = props.max
  emit('update:modelValue', num)
}

const getCurrentNumber = () => {
  if (innerValue.value.trim() !== '') {
    const n = Number(innerValue.value)
    if (!Number.isNaN(n)) return n
  }
  if (props.modelValue !== null && props.modelValue !== undefined) {
    return Number(props.modelValue) || 0
  }
  return 0
}

const stepUp = () => {
  let n = getCurrentNumber() + props.step
  if (n < props.min) n = props.min
  if (n > props.max) n = props.max
  innerValue.value = String(n)
  emit('update:modelValue', n)
}

const stepDown = () => {
  let n = getCurrentNumber() - props.step
  if (n < props.min) n = props.min
  if (n > props.max) n = props.max
  innerValue.value = String(n)
  emit('update:modelValue', n)
}
</script>

<template>
  <div class="w-full">
    <template v-if="component === 'select'">
      <label v-if="displayLabel" class="block text-sm font-medium mb-1" :style="{ color: 'var(--text-color)' }">
        {{ displayLabel }}
        <span v-if="required" class="ml-0.5 text-red-500">*</span>
      </label>
      <BaseSelect
        :model-value="internalValue"
        :options="options || []"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full"
        @update:model-value="onInput"
      />
      <p v-if="firstError" class="mt-2 text-sm text-red-600">
        {{ firstError }}
      </p>
      <p v-else-if="hint" class="mt-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
        {{ hint }}
      </p>
    </template>
    <template v-else>
      <BaseInput
        v-bind="inputProps"
        :model-value="internalValue"
        :error="firstError"
        @update:model-value="onInput"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'

type RuleType = 'required' | 'minLength' | 'maxLength' | 'url' | 'regex' | 'custom'

interface BaseRule {
  type: RuleType
  message?: string
}

interface RequiredRule extends BaseRule {
  type: 'required'
}

interface MinLengthRule extends BaseRule {
  type: 'minLength'
  length: number
}

interface MaxLengthRule extends BaseRule {
  type: 'maxLength'
  length: number
}

interface UrlRule extends BaseRule {
  type: 'url'
}

interface RegexRule extends BaseRule {
  type: 'regex'
  pattern: RegExp
}

interface CustomRule extends BaseRule {
  type: 'custom'
  validator: (value: any, model?: any) => string | null | undefined
}

export type AdminFormRule = RequiredRule | MinLengthRule | MaxLengthRule | UrlRule | RegexRule | CustomRule

interface SelectOption {
  label: string
  value: string | number
  [key: string]: any
}

const props = defineProps<{
  modelValue: any
  rules?: AdminFormRule[]
  model?: any
  label?: string
  placeholder?: string
  type?: string
  hint?: string
  component?: 'input' | 'select'
  options?: SelectOption[]
  disabled?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'valid'): void
  (e: 'invalid', errors: string[]): void
}>()

const internalValue = ref(props.modelValue)
const errors = ref<string[]>([])
const touched = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val
  }
)

const displayLabel = computed(() => props.label || '')

const inputProps = computed(() => ({
  label: displayLabel.value,
  placeholder: props.placeholder,
  type: props.type || 'text',
  hint: !firstError.value ? props.hint : '',
  required: !!props.required,
  disabled: props.disabled
}))

const firstError = computed(() => errors.value[0] || '')

const runValidation = () => {
  const value = internalValue.value
  const result: string[] = []

  const combinedRules: AdminFormRule[] = []
  if (props.required) {
    combinedRules.push({
      type: 'required',
      message: props.label ? `${props.label}为必填项` : '该字段为必填项'
    } as RequiredRule)
  }
  if (props.rules && props.rules.length > 0) {
    combinedRules.push(...props.rules)
  }

  if (combinedRules.length === 0) {
    errors.value = []
    emit('valid')
    return
  }

  for (const rule of combinedRules) {
    if (rule.type === 'required') {
      if (value === null || value === undefined || value === '') {
        result.push(rule.message || '该字段为必填项')
        continue
      }
    } else if (rule.type === 'minLength') {
      const v = String(value || '')
      if (v.length < rule.length) {
        result.push(rule.message || `最少 ${rule.length} 个字符`)
      }
    } else if (rule.type === 'maxLength') {
      const v = String(value || '')
      if (v.length > rule.length) {
        result.push(rule.message || `最多 ${rule.length} 个字符`)
      }
    } else if (rule.type === 'url') {
      const v = String(value || '')
      if (v) {
        // 允许以 / 开头的相对路径，其他情况按绝对 URL 校验
        if (!v.startsWith('/')) {
          try {
             
            new URL(v)
          } catch {
            result.push(rule.message || '请输入合法的 URL')
          }
        }
      }
    } else if (rule.type === 'regex') {
      const v = String(value || '')
      if (v && !rule.pattern.test(v)) {
        result.push(rule.message || '格式不正确')
      }
    } else if (rule.type === 'custom') {
      const msg = rule.validator(value, props.model)
      if (msg) {
        result.push(msg)
      }
    }
  }

  errors.value = result
  if (result.length === 0) {
    emit('valid')
  } else {
    emit('invalid', result)
  }
}

const onInput = (val: any) => {
  internalValue.value = val
  emit('update:modelValue', val)
  if (!touched.value) {
    touched.value = true
  }
  runValidation()
}

onMounted(() => {
  if ((props.rules && props.rules.length > 0) || props.required) {
    runValidation()
  }
})
</script>

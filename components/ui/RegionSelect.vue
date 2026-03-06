<template>
  <div class="w-full">
    <RegionSelects
      v-model="regionValue"
      :town="false"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RegionSelects } from 'v-region'
import type { RegionValues, RegionModel } from 'v-region'

defineProps<{
  modelValue?: string // Format: "Province City District"
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const regionValue = ref<RegionValues>({
  province: '',
  city: '',
  area: ''
})

// Handle change from v-region and convert back to string format
const handleChange = (data: RegionModel) => {
  const p: any = (data as any).province || {}
  const c: any = (data as any).city || {}
  const a: any = (data as any).area || {}
  const pick = (part: any) => part.name || part.label || part.value || ''
  const value = [pick(p), pick(c), pick(a)].filter(Boolean).join(' ')
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

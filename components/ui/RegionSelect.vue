<template>
  <div class="grid grid-cols-3 gap-2">
    <BaseSelect
      data-testid="region-province"
      v-model="selectedProvince"
      :options="provinceOptions"
      placeholder="省份"
      @change="handleProvinceChange"
    />
    <BaseSelect
      data-testid="region-city"
      v-model="selectedCity"
      :options="cityOptions"
      placeholder="城市"
      :disabled="!selectedProvince"
      @change="handleCityChange"
    />
    <BaseSelect
      data-testid="region-district"
      v-model="selectedDistrict"
      :options="districtOptions"
      placeholder="区县"
      :disabled="!selectedCity"
      @change="handleDistrictChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseSelect from './BaseSelect.vue'
import { provinces } from '~/utils/regions'

const props = defineProps<{
  modelValue?: string // Format: "Province City District"
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')

// Initialize from modelValue
watch(() => props.modelValue, (val) => {
  if (val) {
    const parts = val.split(' ')
    if (parts.length >= 1) selectedProvince.value = parts[0]
    if (parts.length >= 2) selectedCity.value = parts[1]
    if (parts.length >= 3) selectedDistrict.value = parts[2]
  } else {
    selectedProvince.value = ''
    selectedCity.value = ''
    selectedDistrict.value = ''
  }
}, { immediate: true })

const provinceOptions = computed(() => {
  return provinces.map(p => ({ label: p.name, value: p.name }))
})

const cityOptions = computed(() => {
  const province = provinces.find(p => p.name === selectedProvince.value)
  return province ? province.cities.map(c => ({ label: c.name, value: c.name })) : []
})

const districtOptions = computed(() => {
  const province = provinces.find(p => p.name === selectedProvince.value)
  const city = province?.cities.find(c => c.name === selectedCity.value)
  return city ? city.districts.map(d => ({ label: d.name, value: d.name })) : []
})

const updateValue = () => {
  const value = [selectedProvince.value, selectedCity.value, selectedDistrict.value]
    .filter(Boolean)
    .join(' ')
  emit('update:modelValue', value)
  emit('change', value)
}

const handleProvinceChange = () => {
  selectedCity.value = ''
  selectedDistrict.value = ''
  updateValue()
}

const handleCityChange = () => {
  selectedDistrict.value = ''
  updateValue()
}

const handleDistrictChange = () => {
  updateValue()
}
</script>

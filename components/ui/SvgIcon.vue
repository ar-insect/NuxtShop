<template>
  <component 
    :is="iconComponent" 
    class="svg-icon"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as HeroIcons from '@heroicons/vue/24/outline'

const props = defineProps<{
  name: string
}>()

const iconComponent = computed(() => {
  let iconName = props.name
  
  // 将 kebab-case 转为 PascalCase
  if (iconName.includes('-')) {
    iconName = iconName.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  } else {
    // 确保首字母大写
    iconName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  }
  
  // 若缺少 'Icon' 后缀则补齐
  if (!iconName.endsWith('Icon')) {
    iconName += 'Icon'
  }

  return (HeroIcons as any)[iconName] || HeroIcons.QuestionMarkCircleIcon
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  width: 1.5rem; /* 24px */
  height: 1.5rem;
}
</style>

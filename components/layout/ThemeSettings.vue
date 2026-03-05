<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const isOpen = ref(false)
const themeStore = useThemeStore()
const { user } = useAuth()

const modes = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '系统', value: 'system' }
] as const

const fontSizes = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
  { label: '特大', value: 'xl' }
] as const

// 预设颜色（按提供的色系：黄/橙/红、粉/紫/靛、蓝/青、绿）
const colors = [
  // Yellow / Amber family
  '#facc15', // yellow-400
  '#f59e0b', // amber-500
  // Orange / Warm orange
  '#f97316', // orange-500
  '#fb923c', // orange-400
  // Red / Coral
  '#ef4444', // red-500
  '#f87171', // red-400
  // Pink
  '#ec4899', // pink-500
  '#f472b6', // pink-400
  // Purple / Violet / Indigo
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#4f46e5', // indigo-600
  '#818cf8', // indigo-400
  // Blue
  '#2563eb', // blue-600
  '#60a5fa', // blue-400
  // Teal / Cyan
  '#06b6d4', // cyan-500
  '#67e8f9', // cyan-300
  // Green / Lime
  '#22c55e', // green-500
  '#84cc16'  // lime-500
]

const radii = [
  { label: '直角', value: '0px' },
  { label: '小圆角', value: '0.25rem' },
  { label: '中圆角', value: '0.5rem' },
  { label: '大圆角', value: '1rem' }
]

const toggle = () => {
  isOpen.value = !isOpen.value
}

const updateColor = (color: string) => {
  themeStore.updateTheme({ primaryColor: color }, user.value?.id?.toString())
}

const updateRadius = (radius: string) => {
  themeStore.updateTheme({ borderRadius: radius }, user.value?.id?.toString())
}

const updateMode = (mode: typeof modes[number]['value']) => {
  themeStore.updateTheme({ mode }, user.value?.id?.toString())
}

const updateFontSize = (fontSize: typeof fontSizes[number]['value']) => {
  themeStore.updateTheme({ fontSize }, user.value?.id?.toString())
}

const reset = () => {
  themeStore.resetTheme(user.value?.id?.toString())
}
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <button 
      class="fixed bottom-6 right-6 p-3 rounded-full bg-[var(--bg-color)] shadow-lg border border-gray-200 hover:shadow-xl transition-all z-50 group"
      title="主题设置"
      @click="toggle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" :style="{ color: 'var(--text-color)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Settings Panel -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex justify-end"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="toggle"/>

      <!-- Drawer -->
      <div 
        class="relative w-80 h-full shadow-2xl p-6 overflow-y-auto animate-slide-in transition-colors duration-200"
        :style="{ backgroundColor: 'var(--bg-color)' }"
      >
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-xl font-bold" :style="{ color: 'var(--text-color)' }">主题设置</h2>
          <button 
            class="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10" 
            :style="{ color: 'var(--text-secondary)' }"
            @click="toggle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="mb-8">
          <h3 class="text-sm font-medium mb-4" :style="{ color: 'var(--text-color)' }">外观</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="mode in modes"
              :key="mode.value"
              class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
              :class="themeStore.theme.mode === mode.value 
                ? 'bg-[var(--primary-color)]/10 font-medium' 
                : 'hover:bg-black/5 dark:hover:bg-white/5'"
              :style="{ 
                borderColor: themeStore.theme.mode === mode.value ? 'var(--primary-color)' : 'var(--border-color)',
                color: themeStore.theme.mode === mode.value ? 'var(--primary-color)' : 'var(--text-secondary)'
              }"
              @click="updateMode(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="text-sm font-medium mb-4" :style="{ color: 'var(--text-color)' }">字体大小</h3>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="size in fontSizes"
              :key="size.value"
              class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
              :class="themeStore.theme.fontSize === size.value 
                ? 'bg-[var(--primary-color)]/10 font-medium' 
                : 'hover:bg-black/5 dark:hover:bg-white/5'"
              :style="{ 
                borderColor: themeStore.theme.fontSize === size.value ? 'var(--primary-color)' : 'var(--border-color)',
                color: themeStore.theme.fontSize === size.value ? 'var(--primary-color)' : 'var(--text-secondary)'
              }"
              @click="updateFontSize(size.value)"
            >
              {{ size.label }}
            </button>
          </div>
        </div>

        <!-- Theme Color -->
        <div class="mb-8">
          <h3 class="text-sm font-medium mb-4" :style="{ color: 'var(--text-color)' }">主题色</h3>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in colors"
              :key="color"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
              :class="themeStore.theme.primaryColor === color ? 'ring-2 ring-offset-2' : 'border-transparent'"
              :style="{ 
                backgroundColor: color,
                borderColor: themeStore.theme.primaryColor === color ? 'var(--text-color)' : 'transparent',
                '--tw-ring-color': 'var(--text-color)',
                '--tw-ring-offset-color': 'var(--bg-color)'
              }"
              @click="updateColor(color)"
            />
          </div>
        </div>

        <!-- Border Radius -->
        <div class="mb-8">
          <h3 class="text-sm font-medium mb-4" :style="{ color: 'var(--text-color)' }">圆角风格</h3>
          <div class="space-y-2">
            <button
              v-for="radius in radii"
              :key="radius.value"
              class="w-full px-4 py-2 text-left text-sm rounded-md border transition-colors"
              :class="themeStore.theme.borderRadius === radius.value 
                ? 'bg-[var(--primary-color)]/10 font-medium' 
                : 'hover:bg-black/5 dark:hover:bg-white/5'"
              :style="{ 
                borderRadius: radius.value,
                borderColor: themeStore.theme.borderRadius === radius.value ? 'var(--primary-color)' : 'var(--border-color)',
                color: themeStore.theme.borderRadius === radius.value ? 'var(--primary-color)' : 'var(--text-secondary)'
              }"
              @click="updateRadius(radius.value)"
            >
              {{ radius.label }}
            </button>
          </div>
        </div>
        
        <!-- Reset Button -->
        <div class="pt-6 border-t" :style="{ borderColor: 'var(--border-color)' }">
          <button 
            class="w-full px-4 py-2 text-sm bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors border"
            :style="{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }"
            @click="reset"
          >
            恢复默认设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

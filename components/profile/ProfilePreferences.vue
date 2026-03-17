<template>
  <BaseCard :title="t('profile.preferences.title')">
    <div class="py-2 space-y-8">
       <div>
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.themeTitle') }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                v-for="theme in themes" 
                :key="theme.value"
                :class="[
                  'cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 transition-all',
                  currentTheme === theme.value 
                    ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/10' 
                    : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                ]"
                @click="setTheme(theme.value)"
              >
                  <component :is="theme.icon" class="h-8 w-8 text-[var(--text-secondary)]" />
                  <span class="text-sm font-medium text-[var(--text-color)]">{{ theme.label }}</span>
              </div>
          </div>
       </div>

       <div class="pt-8 border-t border-[var(--border-color)]">
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.fontSizeTitle') }}
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="size in fontSizes"
              :key="size.value"
              type="button"
              class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
              :class="currentFontSize === size.value ? 'bg-[var(--primary-color)]/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5'"
              :style="{
                borderColor: currentFontSize === size.value ? 'var(--primary-color)' : 'var(--border-color)',
                color: currentFontSize === size.value ? 'var(--primary-color)' : 'var(--text-secondary)'
              }"
              @click="setFontSize(size.value)"
            >
              {{ size.label }}
            </button>
          </div>
       </div>

       <div class="pt-8 border-t border-[var(--border-color)]">
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.primaryColorTitle') }}
          </h4>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in colors"
              :key="color"
              type="button"
              class="h-9 w-9 rounded-full border transition-transform active:scale-95"
              :style="{
                backgroundColor: color,
                borderColor: currentPrimaryColor === color ? 'var(--text-color)' : 'var(--border-color)',
                transform: currentPrimaryColor === color ? 'scale(1.05)' : undefined
              }"
              @click="setPrimaryColor(color)"
            />
          </div>
       </div>

       <div class="pt-8 border-t border-[var(--border-color)]">
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.radiusTitle') }}
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="radius in radii"
              :key="radius.value"
              type="button"
              class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
              :class="currentBorderRadius === radius.value ? 'bg-[var(--primary-color)]/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5'"
              :style="{
                borderColor: currentBorderRadius === radius.value ? 'var(--primary-color)' : 'var(--border-color)',
                color: currentBorderRadius === radius.value ? 'var(--primary-color)' : 'var(--text-secondary)'
              }"
              @click="setBorderRadius(radius.value)"
            >
              {{ radius.label }}
            </button>
          </div>
       </div>

       <div class="pt-8 border-t border-[var(--border-color)]">
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.languageTitle') }}
          </h4>
          <div class="max-w-xs">
              <BaseSelect 
                v-model="currentLanguage"
                :options="[
                  { label: '简体中文 (Chinese Simplified)', value: 'zh-CN' },
                  { label: 'English (US)', value: 'en-US' }
                ]"
              />
          </div>
       </div>

       <!-- Timezone -->
       <div class="pt-8 border-t border-[var(--border-color)]">
          <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
            {{ t('profile.preferences.timezoneTitle') }}
          </h4>
          <div class="max-w-xs">
              <BaseSelect 
                v-model="currentTimezone"
                :options="[
                  { label: 'Asia/Shanghai (GMT+08:00)', value: 'Asia/Shanghai' },
                  { label: 'UTC (GMT+00:00)', value: 'UTC' },
                  { label: 'America/New_York (GMT-05:00)', value: 'America/New_York' }
                ]"
              />
          </div>
       </div>

       <div class="pt-8 border-t border-[var(--border-color)] flex justify-end">
          <BaseButton variant="outline" @click="resetTheme">
            {{ t('profile.preferences.resetTheme') }}
          </BaseButton>
       </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import { useI18nStore, type Locale } from '~/stores/i18n'
import { useI18n } from '~/composables/useI18n'

const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const { user } = useAuth()
const toast = useToast()
const { t } = useI18n()

const themes = computed(() => ([
  { value: 'light', label: t('profile.preferences.themeLight'), icon: SunIcon },
  { value: 'dark', label: t('profile.preferences.themeDark'), icon: MoonIcon },
  { value: 'system', label: t('profile.preferences.themeSystem'), icon: ComputerDesktopIcon }
]))
const currentTheme = computed(() => themeStore.theme.mode)
const currentFontSize = computed(() => themeStore.theme.fontSize)
const currentPrimaryColor = computed(() => themeStore.theme.primaryColor?.toLowerCase() || '#3b82f6')
const currentBorderRadius = computed(() => themeStore.theme.borderRadius)
const currentLanguage = ref<Locale>(i18nStore.locale)
const currentTimezone = ref(user.value?.timezone || 'Asia/Shanghai')

const setTheme = (mode: string) => {
  themeStore.updateTheme({ mode: mode as any })
}

const fontSizes = computed(() => ([
  { label: t('profile.preferences.fontSmall'), value: 'sm' },
  { label: t('profile.preferences.fontMedium'), value: 'md' },
  { label: t('profile.preferences.fontLarge'), value: 'lg' },
  { label: t('profile.preferences.fontXL'), value: 'xl' }
] as const))

const colors = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899'
]

const radii = computed(() => ([
  { label: t('profile.preferences.radiusNone'), value: '0px' },
  { label: t('profile.preferences.radiusSm'), value: '0.25rem' },
  { label: t('profile.preferences.radiusMd'), value: '0.5rem' },
  { label: t('profile.preferences.radiusLg'), value: '1rem' }
]))

const setFontSize = (size: any) => {
  themeStore.updateTheme({ fontSize: size })
}

const setPrimaryColor = (color: string) => {
  themeStore.updateTheme({ primaryColor: color })
}

const setBorderRadius = (radius: string) => {
  themeStore.updateTheme({ borderRadius: radius })
}

const resetTheme = () => {
  themeStore.resetTheme()
}

watch(currentLanguage, async (val) => {
  i18nStore.setLocale(val)

  if (!user.value?._id) return

  try {
    await $fetch('/api/user/update', {
      method: 'POST',
      body: { language: val }
    })
  } catch (e: any) {
    toast.error(e?.statusMessage || '更新语言设置失败')
  }
})

watch(currentTimezone, async (val) => {
  if (!user.value?._id) return

  try {
    await $fetch('/api/user/update', {
      method: 'POST',
      body: { timezone: val }
    })
  } catch (e: any) {
    toast.error(e?.statusMessage || '更新时区失败')
  }
})
</script>

<template>
  <ThemeProvider :theme="styledTheme">
    <div class="app-container">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ThemeProvider } from 'vue3-styled-components'
import { useThemeStore } from '~/stores/theme'
import { useI18nStore } from '~/stores/i18n'

const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const { user } = useAuth()

// 配置全局 Meta
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - NuxtShop` : 'NuxtShop - 现代化全栈电商平台'
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'charset', content: 'utf-8' },
    { name: 'description', content: '基于 Nuxt 3 构建的现代化电商演示项目，包含 SSR、模块化架构、全局状态管理等最佳实践。' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// 初始化主题与语言：如果已登录则加载用户偏好，否则使用默认配置
const initApp = async () => {
  if (user.value?._id) {
    await themeStore.fetchTheme()
    // 将来如果用户模型中有 language 字段，可以在这里用它初始化 i18n
  }
  themeStore.applyTheme()
  themeStore.syncSystemModeListener()

  // 服务器端渲染阶段使用默认/后端推断的语言，避免与客户端 hydration 不一致
  if (import.meta.server) {
    i18nStore.initLocale()
  }
}

// 在服务端和客户端都执行（但客户端这里不再初始化语言）
await initApp()

// 客户端挂载完成后，根据本地存储或浏览器语言更新语言设置，避免 hydration mismatch
onMounted(() => {
  i18nStore.initLocale()
})

// 监听用户登录状态变化，重新加载主题
watch(() => user.value?._id, async (newId) => {
  if (newId) {
    await themeStore.fetchTheme()
  } else {
    themeStore.resetTheme()
  }
})

// 适配 styled-components 的主题对象
const styledTheme = computed(() => ({
  primary: themeStore.theme.primaryColor,
  secondary: '#000000',
  borderRadius: themeStore.theme.borderRadius
}))
</script>

<style>
:root {
  --primary-color: #3b82f6;
  --bg-color: #ffffff;
  --text-color: #1f2937;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --border-color: #e5e7eb;
  --text-secondary: #6b7280;
  --hover-bg: rgba(0, 0, 0, 0.04);
  --muted-bg: rgba(0, 0, 0, 0.03);
  --modal-mask-bg: rgba(0, 0, 0, 0.5);
  --loading-overlay-bg: rgba(255, 255, 255, 0.75);
  --border-radius: 0.5rem;
  --font-size: 16px;
}

html {
  font-size: var(--font-size);
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
</style>

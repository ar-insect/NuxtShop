<template>
  <div class="plugins-demo space-y-6">
    <BaseCard title="全局插件演示" />
    
    <BaseCard title="1. 模板中使用插件">
      <p>直接在模板中使用 <code>$myHelper</code>:</p>
      <ClientOnly>
        <div class="result">
          {{ $myHelper('来自模板的问候') }}
        </div>
        <template #fallback>
          <div class="result">
            加载中...
          </div>
        </template>
      </ClientOnly>
    </BaseCard>

    <BaseCard title="2. Script 中使用插件">
      <p>通过 <code>useNuxtApp()</code> 获取:</p>
      <ClientOnly>
        <div class="result">
          {{ scriptResult }}
        </div>
        <template #fallback>
          <div class="result">
            加载中...
          </div>
        </template>
      </ClientOnly>
      <BaseButton @click="triggerPlugin">重新调用插件</BaseButton>
    </BaseCard>

    <BaseCard title="3. 插件说明">
      <ul>
        <li>插件文件位于: <code>plugins/test-plugin.ts</code></li>
        <li>Nuxt 自动扫描 plugins 目录，无需手动配置。</li>
        <li>使用 <code>provide</code> 返回的对象会自动注入到 Nuxt 实例中。</li>
        <li>注入的属性会自动带上 <code>$</code> 前缀。</li>
      </ul>
    </BaseCard>

    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
  </template>

<script setup lang="ts">
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
const { $myHelper } = useNuxtApp()
const scriptResult = ref('')

// 初始化调用
scriptResult.value = $myHelper('来自 Script Setup 的问候')

const triggerPlugin = () => {
  scriptResult.value = $myHelper('按钮被点击')
}
</script>

<style scoped>
.plugins-demo {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-top: 0;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.result {
  background-color: var(--muted-bg);
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  color: var(--primary-color);
  font-weight: bold;
  margin: 1rem 0;
}

ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>

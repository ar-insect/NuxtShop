<template>
  <div class="ssr-demo">
    <h1>服务端渲染 (SSR) 调试演示</h1>
    
    <div class="space-y-8">
      <BaseCard title="1. 数据展示区域">
      <p>下面的数据是在服务端获取并渲染的。</p>
      <div class="mt-3">
        <div v-if="pending" class="loading">加载中...</div>
        <div v-else-if="error" class="error">加载失败: {{ error.message }}</div>
        <div v-else class="data-display">
          <ul>
            <li><strong>ID:</strong> {{ data?.id }}</li>
            <li><strong>消息:</strong> {{ data?.message }}</li>
            <li><strong>服务端时间:</strong> {{ data?.serverTime }}</li>
            <li><strong>处理结果:</strong> {{ data?.data }}</li>
            <li><strong>User Agent:</strong> <span class="ua">{{ data?.headers }}</span></li>
          </ul>
        </div>
      </div>
      </BaseCard>

      <BaseCard title="2. 调试说明">
      <ol>
        <li>确保已选择 "fullstack: nuxt" 或 "server: nuxt" 调试配置启动。</li>
        <li>打开 server/api/ssr-test.get.ts，在 const query = ... 处设置断点。</li>
        <li>刷新此页面。</li>
        <li>VS Code 将捕获断点，可查看变量。</li>
      </ol>
      </BaseCard>

      <BaseCard title="3. 客户端交互">
      <p>点击下方按钮将在客户端重新发起请求。</p>
      <div class="mt-2 flex gap-2">
        <BaseButton @click="refreshData">刷新数据</BaseButton>
        <BaseButton variant="secondary" @click="updateId">更新 ID 并刷新</BaseButton>
      </div>
      </BaseCard>
    </div>

    <div style="margin-top: 20px;">
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
const currentId = ref('demo-1')

// useFetch 在服务端渲染期间会直接调用 API 函数（模拟请求），
// 在客户端导航时会发起真实的 HTTP 请求。
// 在这里设置断点，可以观察 setup 函数在服务端和客户端的执行情况。
console.log('[SSR 演示] 页面 setup 执行中...')

const { data, pending, error, refresh } = await useFetch<any>('/api/ssr-test', {
  query: { id: currentId }
})

const refreshData = () => {
  refresh()
}

const updateId = () => {
  currentId.value = `demo-${Math.floor(Math.random() * 1000)}`
  // query 参数是响应式的，useFetch 会自动重新请求
}
</script>

<style scoped>
.ssr-demo {
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

.data-display {
  background-color: var(--muted-bg);
  padding: 1rem;
  border-radius: 4px;
  color: var(--text-color);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.ua {
  word-break: break-all;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.loading {
  color: var(--text-secondary);
  font-style: italic;
}

.error {
  color: #ff4d4f;
}
</style>

<template>
  <div class="types-demo">
    <h1>全局类型定义演示</h1>
    
    <div class="card">
      <h2>1. 全局接口 ApiResponse</h2>
      <p>响应数据结构:</p>
      <pre>{{ responseData }}</pre>
    </div>

    <div class="card">
      <h2>2. 全局接口 IUser</h2>
      <p>用户信息:</p>
      <ul>
        <li>ID: {{ userData.id }}</li>
        <li>Username: {{ userData.username }}</li>
        <li>Role: {{ userData.role }}</li>
      </ul>
    </div>

    <div class="card">
      <h2>3. 说明</h2>
      <ul>
        <li>类型文件位于: <code>types/global.d.ts</code></li>
        <li>使用 <code>declare interface</code> 定义的类型可以在全项目直接使用，无需 import。</li>
      </ul>
    </div>

    <div style="margin-top: 20px;">
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// 直接使用全局定义的类型，无需 import
const userData: IUser = {
  id: 1001,
  username: 'trae_user',
  role: 'admin',
  email: 'test@example.com'
}

const responseData: ApiResponse<IUser> = {
  code: 200,
  message: '成功',
  data: userData,
  timestamp: 1689920000000 // 使用固定时间戳避免 hydration mismatch
}
</script>

<style scoped>
.types-demo {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

h2 {
  margin-top: 0;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

pre {
  background-color: var(--bg-color);
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  color: var(--text-color);
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

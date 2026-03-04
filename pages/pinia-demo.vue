<template>
  <div class="pinia-demo">
    <h1>状态管理 (Pinia) 演示</h1>
    
    <div class="grid-container">
      <!-- 计数器示例 -->
      <section class="card">
        <h2>基础示例: 计数器</h2>
        <div class="counter-display">
          <div class="count-value">{{ counter.count }}</div>
          <div class="count-double">双倍值: {{ counter.doubleCount }}</div>
        </div>
        
        <div class="controls">
          <button class="btn btn-primary" @click="counter.increment()">+</button>
          <button class="btn btn-secondary" @click="counter.decrement()">-</button>
          <button class="btn btn-danger" @click="counter.reset()">重置</button>
          <button class="btn btn-info" :disabled="loading" @click="counter.simulateAsyncAction()">
            {{ loading ? '加载中...' : '异步加10' }}
          </button>
        </div>
        
        <div class="store-state">
          <h3>Store 状态:</h3>
          <pre>{{ counter.$state }}</pre>
        </div>
      </section>

      <!-- 用户状态示例 -->
      <section class="card">
        <h2>进阶示例: 用户状态</h2>
        
        <div v-if="userStore.isLoggedIn" class="user-profile">
          <div class="avatar">
            <img :src="userStore.currentUser?.avatar" alt="头像" >
          </div>
          <div class="info">
            <h3>欢迎, {{ userStore.userName }}</h3>
            <p>邮箱: {{ userStore.currentUser?.email }}</p>
            <p>ID: {{ userStore.currentUser?.id }}</p>
            <p>Token: {{ userStore.token }}</p>
            <span v-if="userStore.isAdmin" class="badge badge-admin">管理员</span>
            <span v-else class="badge badge-user">普通用户</span>
          </div>
          
          <div class="user-actions">
            <button class="btn btn-sm" @click="handleUpdateProfile">修改名称</button>
            <button class="btn btn-danger btn-sm" @click="userStore.logout()">退出登录</button>
          </div>
        </div>
        
        <div v-else class="login-form">
          <p>当前未登录</p>
          <div class="form-group">
            <input 
              v-model="loginEmail" 
              type="email" 
              placeholder="输入邮箱 (试试 admin@test.com)" 
              @keyup.enter="handleLogin"
            >
          </div>
          <button class="btn btn-success" :disabled="loginLoading" @click="handleLogin">
            {{ loginLoading ? '登录中...' : '模拟登录' }}
          </button>
        </div>
      </section>
    </div>
    
    <div class="navigation">
      <NuxtLink to="/" class="back-link">返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自动导入 stores (Nuxt 3 特性)
// 如果没有自动导入，可以手动 import { useCounterStore } from '~/stores/counter'
import { useCounterStore } from '~/stores/counter'
import { useUserStore } from '~/stores/user'

const counter = useCounterStore()
const userStore = useUserStore()

const loading = ref(false)
const loginLoading = ref(false)
const loginEmail = ref('')

// 监听异步操作
counter.$onAction(({ name, after, onError }) => {
  if (name === 'simulateAsyncAction') {
    loading.value = true
    after(() => {
      loading.value = false
    })
    onError(() => {
      loading.value = false
    })
  }
})

const handleLogin = async () => {
  if (!loginEmail.value) return
  
  loginLoading.value = true
  try {
    await userStore.login(loginEmail.value)
    loginEmail.value = ''
  } finally {
    loginLoading.value = false
  }
}

const handleUpdateProfile = () => {
  const newName = prompt('请输入新名称:', userStore.currentUser?.name)
  if (newName) {
    userStore.updateProfile({ name: newName })
  }
}
</script>

<style scoped>
.pinia-demo {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

h2 {
  margin-top: 0;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

/* Counter Styles */
.counter-display {
  text-align: center;
  margin-bottom: 1.5rem;
  background: var(--muted-bg);
  padding: 1rem;
  border-radius: 8px;
}

.count-value {
  font-size: 3rem;
  font-weight: bold;
  color: #3b82f6;
}

.count-double {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.store-state {
  background: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  overflow: auto;
}

/* User Styles */
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.info h3 {
  margin: 0 0 0.5rem 0;
}

.info p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.badge-admin {
  background-color: #fee2e2;
  color: #ef4444;
}

.badge-user {
  background-color: #dbeafe;
  color: #3b82f6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-color);
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }

.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover { background: #4b5563; }

.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }

.btn-info { background: #0ea5e9; color: white; }
.btn-info:hover { background: #0284c7; }

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.navigation {
  margin-top: 2rem;
  text-align: center;
}

.back-link {
  color: var(--text-secondary);
  text-decoration: none;
}
.back-link:hover {
  color: var(--text-color);
  text-decoration: underline;
}
</style>

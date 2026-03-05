<template>
  <BaseModal
    v-model="isOpen"
    title="登录您的账户"
    :close-on-mask="true"
  >
    <div class="px-4 py-2">
      <p class="text-center text-sm text-gray-500 mb-8">
        或者使用 <span class="font-medium text-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors" @click="fillAdmin">admin / 123456</span>
      </p>
      <form class="space-y-6" @submit.prevent="handleLogin">
        <input type="hidden" name="remember" value="true" >
        <div class="space-y-4">
          <BaseInput
            id="username"
            v-model="username"
            name="username"
            type="text"
            required
            label="用户名"
            placeholder="请输入用户名"
          />
          <BaseInput
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            label="密码"
            placeholder="请输入密码"
          />
        </div>

        <div>
          <BaseButton
            type="submit"
            :loading="loading"
            :disabled="loading"
            block
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            登录
          </BaseButton>
        </div>
      </form>
      
      <p class="mt-6 text-center text-sm text-gray-600">
        还没有账号？
        <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors" @click="isOpen = false">
          立即注册
        </NuxtLink>
      </p>
    </div>
    
    <template #footer>
      <div class="hidden"/>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const { isOpen } = useLoginModal()
const { login } = useAuth()
const toast = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) return
  
  loading.value = true
  try {
    const success = await login(username.value, password.value, { redirect: false })
    if (success) {
      isOpen.value = false
      // Reset form
      username.value = ''
      password.value = ''
    }
  } finally {
    loading.value = false
  }
}

const fillAdmin = () => {
  username.value = 'admin'
  password.value = '123456'
}
</script>

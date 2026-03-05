<template>
  <div class="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <!-- Steps Header -->
    <div class="flex items-center justify-between mb-10 px-2">
      <div class="flex flex-col items-center">
        <div
class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          :class="step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'">1</div>
        <span class="text-xs mt-2" :class="step >= 1 ? 'text-green-500' : 'text-gray-500'">验证手机号</span>
      </div>
      <div class="flex-1 h-px mx-4" :class="step >= 2 ? 'bg-green-500' : 'bg-gray-200'"/>
      <div class="flex flex-col items-center">
        <div
class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          :class="step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'">2</div>
        <span class="text-xs mt-2" :class="step >= 2 ? 'text-green-500' : 'text-gray-500'">填写账号信息</span>
      </div>
      <div class="flex-1 h-px mx-4" :class="step >= 3 ? 'bg-green-500' : 'bg-gray-200'"/>
      <div class="flex flex-col items-center">
        <div
class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          :class="step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'">3</div>
        <span class="text-xs mt-2" :class="step >= 3 ? 'text-green-500' : 'text-gray-500'">注册成功</span>
      </div>
    </div>

    <!-- Step 1: Verify Phone -->
    <div v-if="step === 1" class="space-y-6">
      <div class="flex border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        <div class="bg-gray-50 px-3 py-3 border-r border-gray-300 text-gray-500 text-sm flex items-center whitespace-nowrap">
          中国 0086
          <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <input 
          v-model="phone" 
          type="tel" 
          placeholder="建议使用常用手机号" 
          class="flex-1 px-4 py-3 outline-none text-sm w-full"
        >
      </div>

      <div class="border border-gray-300 rounded-md p-1">
        <PuzzleCaptcha 
          ref="captchaRef" 
          @success="captchaVerified = true" 
          @fail="captchaVerified = false" 
        />
      </div>

      <BaseButton
        :disabled="!isStep1Valid"
        block
        size="lg"
        class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-lg rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleNextStep"
      >
        同意协议并继续
      </BaseButton>

      <div class="flex items-start gap-2">
        <input 
          id="agreement" 
          v-model="agreed" 
          type="checkbox"
          class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        >
        <label for="agreement" class="text-sm text-gray-500 leading-snug">
          我已阅读并同意 <a href="#" class="text-blue-600 hover:underline">《NuxtShop 用户服务协议和隐私政策》</a>
        </label>
      </div>

      <div class="flex justify-end pt-4">
        <a href="#" class="flex items-center text-sm text-gray-500 hover:text-red-600">
          <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          企业用户注册
        </a>
      </div>
    </div>

    <!-- Step 2: Account Info -->
    <div v-else-if="step === 2" class="space-y-6">
      <div class="space-y-4">
        <BaseInput
          v-model="username"
          type="text"
          label="用户名"
          placeholder="请输入用户名"
        />
        <BaseInput
          v-model="password"
          type="password"
          label="设置密码"
          placeholder="建议使用两种字符组合"
        />
        <BaseInput
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
        />
      </div>

      <BaseButton
        :loading="loading"
        :disabled="loading || !isStep2Valid"
        block
        size="lg"
        class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-lg rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '立即注册' }}
      </BaseButton>
      
      <div class="text-center">
        <button class="text-sm text-gray-500 hover:text-gray-700" @click="step = 1">返回上一步</button>
      </div>
    </div>

    <!-- Step 3: Success -->
    <div v-else class="text-center py-8 space-y-6">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-gray-900">注册成功</h3>
      <p class="text-gray-500">恭喜您，账号已注册成功！</p>
      
      <div class="pt-4">
        <NuxtLink to="/" class="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-lg rounded-sm transition-colors">
          立即购物
        </NuxtLink>
        <p class="mt-4 text-sm text-gray-500">
          <span class="font-medium text-indigo-600 cursor-pointer" @click="openLoginModal">立即登录</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PuzzleCaptcha from '~/components/ui/PuzzleCaptcha.vue'

const { register } = useAuth()
const { openLoginModal } = useLoginModal()
const toast = useToast()

// State
const step = ref(1)
const loading = ref(false)

// Step 1 Data
const phone = ref('')
const agreed = ref(false)
const captchaVerified = ref(false)
const captchaRef = ref<InstanceType<typeof PuzzleCaptcha> | null>(null)

// Step 2 Data
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

// Computed
const isStep1Valid = computed(() => {
  return phone.value.length >= 11 && captchaVerified.value && agreed.value
})

const isStep2Valid = computed(() => {
  return username.value.length > 0 && password.value.length >= 6 && password.value === confirmPassword.value
})

// Methods
const handleNextStep = () => {
  if (!isStep1Valid.value) {
    if (!phone.value) toast.error('请输入手机号')
    else if (!captchaVerified.value) toast.error('请完成验证')
    else if (!agreed.value) toast.error('请同意协议')
    return
  }
  step.value = 2
}

const handleRegister = async () => {
  if (!isStep2Valid.value) return
  
  loading.value = true
  try {
    const success = await register(username.value, password.value, confirmPassword.value, phone.value)
    if (success) {
      step.value = 3
    }
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: '用户注册',
  description: '注册您的 NuxtShop 账户。'
})

definePageMeta({
  layout: 'auth'
})
</script>

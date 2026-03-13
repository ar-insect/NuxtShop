<template>
  <BaseModal v-model="isOpen" title="登录" @cancel="closeLoginModal">
    <form class="space-y-4" @submit.prevent="handleLogin">
      <BaseInput
        id="login-username"
        v-model="username"
        label="用户名"
        type="text"
        required
      />
      <BaseInput
        id="login-password"
        v-model="password"
        label="密码"
        type="password"
        required
      />
      <BaseButton type="submit" :loading="loading" block>
        登录
      </BaseButton>
    </form>
    <div class="mt-4 text-center text-sm">
      还没有账户？
      <NuxtLink to="/register" class="text-[var(--primary-color)] hover:underline" @click="closeLoginModal">
        立即注册
      </NuxtLink>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useAuth } from '~/composables/useAuth'
import { validateUsername, validatePassword } from '~/utils/validation'

const { isOpen, closeLoginModal } = useLoginModal()
const { login } = useAuth()
const toast = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  const usernameError = validateUsername(username.value)
  if (usernameError) {
    toast.error(usernameError)
    return
  }
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    toast.error(passwordError)
    return
  }

  loading.value = true
  const success = await login(username.value, password.value)
  if (success) {
    closeLoginModal()
    username.value = ''
    password.value = ''
  }
  loading.value = false
}
</script>

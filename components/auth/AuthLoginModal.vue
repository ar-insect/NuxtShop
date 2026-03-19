<template>
  <BaseModal v-model="isOpen" :title="t('pages.login.heading')" @cancel="closeLoginModal">
    <form class="space-y-4" @submit.prevent="handleLogin">
      <BaseInput
        id="login-username"
        ref="usernameInputRef"
        v-model="username"
        :label="t('pages.login.usernameLabel')"
        type="text"
        required
      />
      <BaseInput
        id="login-password"
        v-model="password"
        :label="t('pages.login.passwordLabel')"
        type="password"
        required
      />
      <BaseButton type="submit" :loading="loading" block>
        {{ t('pages.login.submit') }}
      </BaseButton>
    </form>
    <div class="mt-4 text-center text-sm">
      {{ t('pages.login.goRegisterPrefix') }}
      <NuxtLink to="/register" class="text-[var(--primary-color)] hover:underline" @click="closeLoginModal">
        {{ t('pages.login.goRegisterLink') }}
      </NuxtLink>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useAuth } from '~/composables/useAuth'
import { validateUsername, validatePassword } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const { isOpen, closeLoginModal } = useLoginModal()
const { login } = useAuth()
const toast = useToast()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const loading = ref(false)
const usernameInputRef = ref<InstanceType<typeof import('~/components/ui/BaseInput.vue')['default']> | null>(null)

watch(
  isOpen,
  async (open) => {
    if (open) {
      await nextTick()
      const el = (usernameInputRef.value as any)?.$el?.querySelector?.('input') as HTMLInputElement | null
      el?.focus()
    }
  }
)

const handleLogin = async () => {
  const usernameError = validateUsername(username.value)
  if (usernameError) {
    toast.error(t(usernameError))
    return
  }
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    toast.error(t(passwordError))
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

<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        @click="closeLoginModal"
      >
        <transition name="modal-zoom">
          <div
            v-if="isOpen"
            class="relative w-full max-w-md mx-4 rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.45)] px-6 py-7 sm:px-8 sm:py-8 overflow-hidden"
            @click.stop
          >
            <!-- decorative circles -->
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute -top-8 right-4 h-16 w-16 rounded-full bg-pink-200/60 blur-xl" />
              <div class="absolute -bottom-10 left-0 h-20 w-20 rounded-full bg-sky-200/70 blur-xl" />
            </div>

            <button
            type="button"
            class="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm hover:text-slate-700 hover:bg-white"
            @click="closeLoginModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            </button>

            <div class="relative z-10 space-y-6">
              <div class="space-y-1">
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ t('pages.login.heading') }}
                </h3>
                <p class="text-xs text-slate-600">
                  {{ t('pages.login.helperPrefix') }}
                </p>
              </div>

              <form class="space-y-4" @submit.prevent="handleLogin">
                <template v-if="step === 'password'">
                <BaseInput
                  id="login-username"
                  ref="usernameInputRef"
                  v-model="username"
                  :label="t('pages.login.usernameLabel')"
                  :error="usernameError"
                  type="text"
                  required
                />
                <BaseInput
                  id="login-password"
                  v-model="password"
                  :label="t('pages.login.passwordLabel')"
                  :error="passwordError"
                  type="password"
                  required
                />
                </template>

                <template v-else>
                  <p class="text-xs text-slate-600">
                    {{ t('pages.login.twoFactorHint', { phone: twoFAMaskedPhone || '***' }) }}
                  </p>
                  <BaseInput
                  id="login-twofa-code"
                  v-model="twoFACode"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  :label="t('pages.login.twoFactorCodePlaceholder')"
                  :error="twoFACodeError"
                />
                </template>

                <BaseButton type="submit" :loading="loading" block>
                  {{ step === 'password' ? t('pages.login.submit') : t('pages.login.twoFactorSubmit') }}
                </BaseButton>
              </form>

              <div class="pt-2 text-center text-xs sm:text-sm text-slate-600">
                {{ t('pages.login.goRegisterPrefix') }}
                <NuxtLink
                  to="/register"
                  class="font-semibold text-[var(--primary-color)] hover:underline"
                  @click="closeLoginModal"
                >
                  {{ t('pages.login.goRegisterLink') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useAuth } from '~/composables/useAuth'
import { validateUsername, validatePassword } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const { isOpen, closeLoginModal } = useLoginModal()
const { login, verifyTwoFactorLogin } = useAuth()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const twoFACode = ref('')

const usernameError = ref('')
const passwordError = ref('')
const twoFACodeError = ref('')

const loading = ref(false)
const step = ref<'password' | 'code'>('password')
const twoFAUserId = ref('')
const twoFAMaskedPhone = ref('')
const usernameInputRef = ref<InstanceType<typeof import('~/components/ui/BaseInput.vue')['default']> | null>(null)

watch(
  isOpen,
  async (open) => {
    if (open) {
      step.value = 'password'
      twoFAUserId.value = ''
      twoFAMaskedPhone.value = ''
      twoFACode.value = ''
      await nextTick()
      const el = (usernameInputRef.value as any)?.$el?.querySelector?.('input') as HTMLInputElement | null
      el?.focus()
    }
  }
)

const handleLogin = async () => {
  if (step.value === 'password') {
    const usernameErrorKey = validateUsername(username.value)
    const passwordErrorKey = validatePassword(password.value)
    usernameError.value = usernameErrorKey ? t(usernameErrorKey) : ''
    passwordError.value = passwordErrorKey ? t(passwordErrorKey) : ''

    if (usernameErrorKey || passwordErrorKey) {
      return
    }

    loading.value = true
    try {
      const result = await login(username.value, password.value, { redirect: false })
      if (result.success) {
        closeLoginModal()
        username.value = ''
        password.value = ''
        usernameError.value = ''
        passwordError.value = ''
        return
      }
      if (result.requires2FA) {
        twoFAUserId.value = result.userId
        twoFAMaskedPhone.value = result.maskedPhone || ''
        twoFACode.value = ''
        twoFACodeError.value = ''
        step.value = 'code'
      } else {
        password.value = ''
      }
    } finally {
      loading.value = false
    }
  } else {
    if (!twoFACode.value.trim()) {
      passwordError.value = ''
      usernameError.value = ''
      twoFACodeError.value = t('pages.login.twoFactorCodeRequired')
      return
    }
    loading.value = true
    try {
      const ok = await verifyTwoFactorLogin(twoFAUserId.value, twoFACode.value.trim(), { redirect: false })
      if (ok) {
        closeLoginModal()
        username.value = ''
        password.value = ''
        twoFACode.value = ''
        step.value = 'password'
      } else {
        twoFACode.value = ''
      }
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: opacity 0.22s ease-out, transform 0.22s ease-out;
}

.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}
</style>

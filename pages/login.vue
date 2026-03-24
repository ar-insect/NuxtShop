<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-200 via-sky-100 to-blue-200 flex items-center justify-center">
    <div class="pointer-events-none absolute inset-0 opacity-70">
      <div class="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-pink-300/70 blur-3xl animate-float-slow" />
      <div class="absolute -bottom-16 left-10 h-52 w-52 rounded-full bg-yellow-200/80 blur-2xl animate-float-medium" />
      <div class="absolute -right-12 top-8 h-60 w-60 rounded-full bg-blue-300/70 blur-3xl animate-float-slow" />
      <div class="absolute bottom-10 right-16 h-40 w-40 rounded-full bg-rose-300/80 blur-2xl animate-float-fast" />
    </div>

    <div class="relative z-10 flex w-full items-center justify-center px-4 sm:px-10">
      <div class="relative w-full max-w-4xl rounded-[40px] border border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_26px_80px_rgba(15,23,42,0.35)] px-6 py-12 sm:px-16 sm:py-16 overflow-hidden">
        <!-- inner floating circles on the card -->
        <div class="pointer-events-none absolute inset-0">
          <div class="absolute -top-10 right-10 h-24 w-24 rounded-full bg-white/55 blur-xl" />
          <div class="absolute -left-14 bottom-10 h-40 w-40 rounded-full bg-white/40 blur-xl" />
          <div class="absolute bottom-[-28px] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-rose-300/80 blur-lg" />
        </div>

        <div class="relative flex flex-col gap-10 sm:flex-row sm:items-center">
          <div class="sm:w-1/2 space-y-4">
            <h2 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-[0_4px_16px_rgba(15,23,42,0.45)]">
              {{ t('pages.login.heading') }}
            </h2>
            <p class="text-sm sm:text-base text-slate-700">
              {{ t('pages.login.helperPrefix') }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600">
              {{ t('pages.login.forgotPasswordPrefix') }}
              <button
                type="button"
                class="font-semibold text-[var(--primary-color)] underline underline-offset-2 decoration-[var(--primary-color)]/70 hover:decoration-[var(--primary-color)]"
              >
                {{ t('pages.login.forgotPasswordLink') }}
              </button>
            </p>
            <p class="text-xs sm:text-sm text-slate-600">
              {{ t('pages.login.goRegisterPrefix') }}
              <NuxtLink to="/register" class="font-semibold text-[var(--primary-color)] underline-offset-2 hover:underline">
                {{ t('pages.login.goRegisterLink') }}
              </NuxtLink>
            </p>
          </div>

          <form class="sm:w-1/2 mt-4 sm:mt-0 space-y-6" @submit.prevent="handleLogin">
            <input type="hidden" name="remember" value="true" >

            <div v-if="step === 'password'" class="space-y-5">
              <div>
                <label for="username" class="sr-only">{{ t('pages.login.usernameLabel') }}</label>
                <input
                  id="username"
                  v-model="username"
                  name="username"
                  type="text"
                  required
                  class="appearance-none relative block w-full px-5 py-3 border border-slate-200 bg-white placeholder-slate-400 text-slate-900 rounded-full focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/40 focus:z-10 text-sm"
                  :placeholder="t('pages.login.usernamePlaceholder')"
                >
              </div>
              <div>
                <label for="password" class="sr-only">{{ t('pages.login.passwordLabel') }}</label>
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  type="password"
                  required
                  class="appearance-none relative block w-full px-5 py-3 border border-slate-200 bg-white placeholder-slate-400 text-slate-900 rounded-full focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/40 focus:z-10 text-sm"
                  :placeholder="t('pages.login.passwordPlaceholder')"
                >
              </div>
            </div>

            <div v-else class="space-y-4">
              <p class="text-xs sm:text-sm text-slate-700">
                {{ t('pages.login.twoFactorHint', { phone: twoFAMaskedPhone || '***' }) }}
              </p>
              <div>
                <label for="twofa-code" class="sr-only">2FA Code</label>
                <input
                  id="twofa-code"
                  v-model="twoFACode"
                  name="twofa-code"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  class="appearance-none relative block w-full px-5 py-3 border border-slate-200 bg-white placeholder-slate-400 text-slate-900 rounded-full focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/40 focus:z-10 text-sm tracking-[0.35em]"
                  :placeholder="t('pages.login.twoFactorCodePlaceholder')"
                >
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-full text-[var(--primary-color)] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.28)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.34)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-4 text-[var(--primary-color)]">
                  <svg
                    class="h-5 w-5"
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
                {{ loading ? t('pages.login.submitting') : (step === 'password' ? t('pages.login.submit') : t('pages.login.twoFactorSubmit')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { validateUsername, validatePassword } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const username = ref('')
const password = ref('')
const loading = ref(false)
const step = ref<'password' | 'code'>('password')
const twoFAUserId = ref('')
const twoFAMaskedPhone = ref('')
const twoFACode = ref('')
const { login, verifyTwoFactorLogin } = useAuth()
const toast = useToast()
const { t } = useI18n()

useSeoMeta({
  title: t('seo.login.title'),
  description: t('seo.login.description')
})

const handleLogin = async () => {
  if (step.value === 'password') {
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
    try {
      const result = await login(username.value, password.value, { redirect: false })
      if (result.success) {
        await navigateTo('/')
        return
      }
      if (result.requires2FA) {
        twoFAUserId.value = result.userId
        twoFAMaskedPhone.value = result.maskedPhone || ''
        step.value = 'code'
        toast.info(t('pages.login.twoFactorSent', { phone: twoFAMaskedPhone.value || '***' }))
      } else {
        password.value = ''
      }
    } finally {
      loading.value = false
    }
  } else {
    if (!twoFACode.value.trim()) {
      toast.error(t('pages.login.twoFactorCodeRequired'))
      return
    }
    loading.value = true
    try {
      const ok = await verifyTwoFactorLogin(twoFAUserId.value, twoFACode.value.trim(), { redirect: true })
      if (!ok) {
        twoFACode.value = ''
      }
    } finally {
      loading.value = false
    }
  }
}

definePageMeta({
  layout: 'auth'
})
</script>

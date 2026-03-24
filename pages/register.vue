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
        <div class="pointer-events-none absolute inset-0">
          <div class="absolute -top-10 right-10 h-24 w-24 rounded-full bg-white/55 blur-xl" />
          <div class="absolute -left-14 bottom-10 h-40 w-40 rounded-full bg-white/40 blur-xl" />
          <div class="absolute bottom-[-28px] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-rose-300/80 blur-lg" />
        </div>

        <div class="relative flex flex-col gap-10 sm:flex-row sm:items-start">
          <!-- Left text / steps summary -->
          <div class="sm:w-1/2 space-y-5">
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {{ t('pages.register.heading') }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-600">
              {{ t('pages.register.description') }}
            </p>

            <div class="flex items-center gap-4 pt-4">
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  :class="step >= 1 ? 'bg-[var(--primary-color)] text-white' : 'bg-slate-200 text-slate-500'"
                >
                  1
                </div>
                <span class="text-[11px] mt-2" :class="step >= 1 ? 'text-[var(--primary-color)]' : 'text-slate-500'">
                  {{ t('pages.register.step1') }}
                </span>
              </div>
              <div class="h-px flex-1" :class="step >= 2 ? 'bg-[var(--primary-color)]' : 'bg-slate-200'" />
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  :class="step >= 2 ? 'bg-[var(--primary-color)] text-white' : 'bg-slate-200 text-slate-500'"
                >
                  2
                </div>
                <span class="text-[11px] mt-2" :class="step >= 2 ? 'text-[var(--primary-color)]' : 'text-slate-500'">
                  {{ t('pages.register.step2') }}
                </span>
              </div>
              <div class="h-px flex-1" :class="step >= 3 ? 'bg-[var(--primary-color)]' : 'bg-slate-200'" />
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  :class="step >= 3 ? 'bg-[var(--primary-color)] text-white' : 'bg-slate-200 text-slate-500'"
                >
                  3
                </div>
                <span class="text-[11px] mt-2" :class="step >= 3 ? 'text-[var(--primary-color)]' : 'text-slate-500'">
                  {{ t('pages.register.step3') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right form area -->
          <div class="sm:w-1/2 mt-4 sm:mt-0 space-y-8">
            <!-- Step 1 -->
            <div v-if="step === 1" class="space-y-6">
              <div class="flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary-color)]/40 focus-within:border-[var(--primary-color)]">
                <div class="bg-slate-50 px-4 py-3 border-r border-slate-200 text-slate-600 text-sm flex items-center whitespace-nowrap">
                  {{ t('pages.register.regionLabel') }}
                  <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <input
                  v-model="phone"
                  type="tel"
                  :placeholder="t('pages.register.phonePlaceholder')"
                  class="flex-1 px-4 py-3 outline-none text-sm w-full bg-transparent text-slate-900 placeholder-slate-400"
                >
              </div>

              <div class="relative rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm">
                <div
                  v-if="!canUseCaptcha"
                  class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/75 text-xs sm:text-sm text-slate-500"
                >
                  {{ t('pages.register.captchaPhoneRequired') }}
                </div>
                <div :class="!canUseCaptcha ? 'pointer-events-none opacity-40' : ''">
                  <PuzzleCaptcha
                    ref="captchaRef"
                    @success="captchaVerified = true"
                    @fail="captchaVerified = false"
                  />
                </div>
              </div>

              <BaseButton
                :disabled="!isStep1Valid"
                block
                size="lg"
                class="w-full py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark,rgba(79,70,229,0.95))] text-white font-medium text-base rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleNextStep"
              >
                {{ t('pages.register.agreeAndContinue') }}
              </BaseButton>

              <div class="flex items-start gap-2">
                <input
                  id="agreement"
                  v-model="agreed"
                  type="checkbox"
                  class="mt-1 h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-slate-300 rounded"
                >
                <label for="agreement" class="text-xs sm:text-sm text-slate-600 leading-snug">
                  {{ t('pages.register.agreementPrefix') }}
                  <a href="#" class="text-[var(--primary-color)] hover:underline">{{ t('pages.register.agreementLink') }}</a>
                </label>
              </div>

              <div class="flex justify-end pt-2">
                <button type="button" class="flex items-center text-xs sm:text-sm text-slate-500 hover:text-[var(--primary-color)]">
                  <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ t('pages.register.enterpriseRegister') }}
                </button>
              </div>
            </div>

            <!-- Step 2 -->
            <div v-else-if="step === 2" class="space-y-6">
              <div class="space-y-4">
                <BaseInput
                  v-model="username"
                  type="text"
                  :label="t('pages.register.usernameLabel')"
                  :placeholder="t('pages.register.usernamePlaceholder')"
                />
                <BaseInput
                  v-model="password"
                  type="password"
                  :label="t('pages.register.passwordLabel')"
                  :placeholder="t('pages.register.passwordPlaceholder')"
                />
                <BaseInput
                  v-model="confirmPassword"
                  type="password"
                  :label="t('pages.register.confirmPasswordLabel')"
                  :placeholder="t('pages.register.confirmPasswordPlaceholder')"
                />
              </div>

              <BaseButton
                :loading="loading"
                :disabled="loading || !isStep2Valid"
                block
                size="lg"
                class="w-full py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark,rgba(79,70,229,0.95))] text-white font-medium text-base rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleRegister"
              >
                {{ loading ? t('pages.register.submitting') : t('pages.register.submit') }}
              </BaseButton>

              <div class="text-center">
                <button class="text-xs sm:text-sm text-slate-500 hover:text-[var(--primary-color)]" @click="step = 1">
                  {{ t('pages.register.backPrev') }}
                </button>
              </div>
            </div>

            <!-- Step 3 -->
            <div v-else class="text-center py-4 space-y-6">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                <svg class="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-slate-900">{{ t('pages.register.successTitle') }}</h3>
              <p class="text-slate-600">{{ t('pages.register.successDesc') }}</p>

              <div class="pt-2 space-y-3">
                <NuxtLink
                  to="/"
                  class="inline-block w-full py-3 bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark,rgba(79,70,229,0.95))] text-white font-medium text-base rounded-full transition-colors"
                >
                  {{ t('pages.register.goShopping') }}
                </NuxtLink>
                <p class="mt-1 text-xs sm:text-sm text-slate-600">
                  <NuxtLink to="/login" class="font-medium text-[var(--primary-color)] hover:underline">
                    {{ t('pages.register.goLoginNow') }}
                  </NuxtLink>
                </p>
              </div>
            </div>

            <!-- Common: already have account -->
            <div v-if="step === 1 || step === 2" class="pt-2 text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              {{ t('pages.register.goLoginPrefix') }}
              <NuxtLink
                to="/login"
                class="font-semibold text-[var(--primary-color)] hover:underline"
              >
                {{ t('pages.register.goLoginLink') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PuzzleCaptcha from '~/components/ui/PuzzleCaptcha.vue'
import { validatePhone, validateUsername, validatePassword, validateConfirmPassword } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const { register } = useAuth()
const toast = useToast()
const { t } = useI18n()

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
  return !validatePhone(phone.value) && captchaVerified.value && agreed.value
})

const canUseCaptcha = computed(() => {
  return !validatePhone(phone.value)
})

const isStep2Valid = computed(() => {
  return !validateUsername(username.value) &&
    !validatePassword(password.value) &&
    !validateConfirmPassword(password.value, confirmPassword.value)
})

// Methods
const handleNextStep = () => {
  if (!isStep1Valid.value) {
    const phoneError = validatePhone(phone.value)
    if (phoneError) toast.error(t(phoneError))
    else if (!captchaVerified.value) toast.error(t('pages.register.captchaRequired'))
    else if (!agreed.value) toast.error(t('pages.register.agreementRequired'))
    return
  }
  step.value = 2
}

const handleRegister = async () => {
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
  const confirmError = validateConfirmPassword(password.value, confirmPassword.value)
  if (confirmError) {
    toast.error(t(confirmError))
    return
  }
  
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
  title: t('seo.register.title'),
  description: t('seo.register.description')
})

definePageMeta({
  layout: 'auth'
})
</script>

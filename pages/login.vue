<template>
  <div>
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ t('pages.login.heading') }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ t('pages.login.helperPrefix') }}
        <span class="font-medium text-indigo-600 hover:text-indigo-500">admin / 123456</span>
      </p>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ t('pages.login.goRegisterPrefix') }}
        <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          {{ t('pages.login.goRegisterLink') }}
        </NuxtLink>
      </p>
    </div>
    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <input type="hidden" name="remember" value="true" >
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">{{ t('pages.login.usernameLabel') }}</label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500 focus:z-10 sm:text-sm"
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
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:border-indigo-500 focus:z-10 sm:text-sm"
            :placeholder="t('pages.login.passwordPlaceholder')"
          >
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <!-- LockClosedIcon -->
            <svg
              class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
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
          {{ loading ? t('pages.login.submitting') : t('pages.login.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { validateUsername, validatePassword } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const username = ref('')
const password = ref('')
const loading = ref(false)
const { login } = useAuth()
const toast = useToast()
const { t } = useI18n()

useSeoMeta({
  title: t('seo.login.title'),
  description: t('seo.login.description')
})

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
  try {
    const success = await login(username.value, password.value)
    if (!success) {
      password.value = ''
    }
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'auth'
})
</script>

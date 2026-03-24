<template>
  <BaseCard :title="t('profile.security.title')">
    <div class="py-2 space-y-8">
      <!-- Change Password -->
      <div>
        <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
          {{ t('profile.security.changePasswordTitle') }}
        </h4>
        <form class="max-w-md space-y-4" @submit.prevent="updatePassword">
          <BaseInput
            v-model="passwordForm.current"
            type="password"
            :label="t('profile.security.currentPasswordLabel')"
            :placeholder="t('profile.security.currentPasswordPlaceholder')"
          />
          <BaseInput
            v-model="passwordForm.new"
            type="password"
            :label="t('profile.security.newPasswordLabel')"
            :placeholder="t('profile.security.newPasswordPlaceholder')"
            :hint="t('profile.security.newPasswordHint')"
            :error="newPasswordError"
          />
          <BaseInput
            v-model="passwordForm.confirm"
            type="password"
            :label="t('profile.security.confirmPasswordLabel')"
            :placeholder="t('profile.security.confirmPasswordPlaceholder')"
            :error="passwordForm.new !== passwordForm.confirm && passwordForm.confirm ? t('profile.security.confirmPasswordError') : ''"
          />
          <div class="pt-2">
            <BaseButton type="submit" :loading="updatingPassword" :disabled="!isPasswordValid">
              {{ t('profile.security.updatePasswordButton') }}
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="pt-8 border-t border-[var(--border-color)]">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-[var(--text-color)]">
              {{ t('profile.security.twoFactorTitle') }}
            </h4>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">
              {{ t('profile.security.twoFactorDesc') }}
            </p>
          </div>
          <div class="flex items-center">
            <BaseSwitch
              v-model="twoFactorEnabled"
              :aria-label="t('profile.security.twoFactorTitle')"
              @change="toggle2FA"
            />
          </div>
        </div>
      </div>

      <!-- Login History -->
      <div class="pt-8 border-t border-[var(--border-color)]">
        <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
          {{ t('profile.security.loginHistoryTitle') }}
        </h4>
        <div class="relative overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]">
          <table class="min-w-full divide-y divide-[var(--border-color)] text-sm">
            <thead class="bg-[var(--muted-bg)]/60">
              <tr>
                <th scope="col" class="py-2.5 pl-4 pr-3 text-left font-medium text-[var(--text-secondary)] sm:pl-6">
                  {{ t('profile.security.loginHistoryDevice') }}
                </th>
                <th scope="col" class="px-3 py-2.5 text-left font-medium text-[var(--text-secondary)]">
                  {{ t('profile.security.loginHistoryTime') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              <tr v-for="log in loginHistory" :key="log.id" class="bg-[var(--card-bg)]">
                <td class="whitespace-nowrap py-3 pl-4 pr-3 text-[var(--text-color)] sm:pl-6 max-w-[200px] truncate">
                  {{ log.device }}
                </td>
                <td class="whitespace-nowrap px-3 py-3 text-[var(--text-secondary)]">
                  {{ formatDateTime(log.time, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                </td>
              </tr>
              <tr v-if="!loginHistory.length">
                <td colspan="2" class="py-4 px-4 text-center text-xs text-[var(--text-secondary)]">
                  <BaseEmpty
                    :title="t('profile.security.loginHistoryTitle')"
                    :description="t('profile.security.loginHistoryEmptyDesc')"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useLocaleFormatter } from '~/composables/useLocaleFormatter'

const toast = useToast()
const { t } = useI18n()
const { user, logout } = useAuth()
const { formatDateTime } = useLocaleFormatter()

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})
const updatingPassword = ref(false)
const twoFactorEnabled = ref(false)

const { data: loginHistoryData, pending: loginHistoryPending } = await useAsyncData(
  'user-login-history',
  () => $fetch<{ code: number; message: string; data: { id: string; device: string; ip: string; time: string; status: string }[] }>(
    '/api/user/login-history'
  ),
  {
    server: false
  }
)

const loginHistory = computed(() => loginHistoryData.value?.data || [])

watch(
  user,
  (val) => {
    twoFactorEnabled.value = !!val?.twoFactorEnabled
  },
  { immediate: true }
)

const isPasswordValid = computed(() => {
  return passwordForm.current &&
         passwordForm.new &&
         passwordForm.new.length >= 8 &&
         passwordForm.new === passwordForm.confirm &&
         passwordForm.new !== passwordForm.current
})

const newPasswordError = computed(() => {
  if (!passwordForm.new) return ''
  if (passwordForm.new === passwordForm.current) {
    return t('profile.security.newPasswordSameError')
  }
  return ''
})

const updatePassword = async () => {
  if (!isPasswordValid.value) return
  try {
    updatingPassword.value = true
    await $fetch('/api/user/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
        confirmPassword: passwordForm.confirm
      }
    })
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''
    toast.success(t('profile.security.updatePasswordSuccess'))
    logout()
  } catch (e: any) {
    const msg = e?.data?.message || e?.statusMessage || t('toast.profileUpdateFailed')
    toast.error(msg)
  } finally {
    updatingPassword.value = false
  }
}

const toggle2FA = async (value: boolean) => {
  try {
    await $fetch('/api/user/two-factor', {
      method: 'POST',
      body: { enabled: value }
    })
    if (user.value) {
      user.value = { ...user.value, twoFactorEnabled: value }
    }
    toast.success(value ? t('profile.security.twoFactorOn') : t('profile.security.twoFactorOff'))
  } catch (e: any) {
    twoFactorEnabled.value = !value
    const msg = e?.data?.message || e?.statusMessage || t('toast.profileUpdateFailed')
    toast.error(msg)
  }
}
</script>

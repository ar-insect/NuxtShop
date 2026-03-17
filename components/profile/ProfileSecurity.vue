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
             <button 
              :class="[
                twoFactorEnabled ? 'bg-teal-600' : 'bg-gray-200',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none'
              ]"
              @click="toggle2FA"
             >
              <span 
                :class="[
                  twoFactorEnabled ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                ]"
              />
             </button>
          </div>
        </div>
      </div>

      <!-- Login History -->
      <div class="pt-8 border-t border-[var(--border-color)]">
        <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">
          {{ t('profile.security.loginHistoryTitle') }}
        </h4>
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-[var(--border-color)]">
            <thead class="bg-[var(--muted-bg)]">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[var(--text-color)] sm:pl-6">
                  {{ t('profile.security.loginHistoryDevice') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">
                  {{ t('profile.security.loginHistoryIp') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">
                  {{ t('profile.security.loginHistoryTime') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">
                  {{ t('profile.security.loginHistoryStatus') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)] bg-[var(--card-bg)]">
              <tr v-for="log in loginHistory" :key="log.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[var(--text-color)] sm:pl-6">
                  {{ log.device }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{{ log.ip }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-[var(--text-secondary)]">{{ log.time }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    {{ t('profile.security.loginHistoryStatusSuccess') }}
                  </span>
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

const toast = useToast()
const { t } = useI18n()

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})
const updatingPassword = ref(false)
const twoFactorEnabled = ref(false)
const loginHistory = ref([
  { id: 1, device: 'MacBook Pro', ip: '192.168.1.101', time: '2023-05-20 14:30:00' },
  { id: 2, device: 'iPhone 13', ip: '10.0.0.5', time: '2023-05-19 09:15:00' },
  { id: 3, device: 'Windows PC', ip: '172.16.0.23', time: '2023-05-15 18:45:00' },
])

const isPasswordValid = computed(() => {
  return passwordForm.current && 
         passwordForm.new && 
         passwordForm.new.length >= 8 &&
         passwordForm.new === passwordForm.confirm
})

const updatePassword = async () => {
  updatingPassword.value = true
  // 模拟 API 请求
  await new Promise(resolve => setTimeout(resolve, 1000))
  updatingPassword.value = false
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  toast.success(t('profile.security.updatePasswordSuccess'))
}

const toggle2FA = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  toast.success(twoFactorEnabled.value ? t('profile.security.twoFactorOn') : t('profile.security.twoFactorOff'))
}
</script>

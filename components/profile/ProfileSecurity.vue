<template>
  <BaseCard title="安全设置">
    <div class="py-2 space-y-8">
      <!-- Change Password -->
      <div>
        <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">修改密码</h4>
        <form class="max-w-md space-y-4" @submit.prevent="updatePassword">
          <BaseInput
            v-model="passwordForm.current"
            type="password"
            label="当前密码"
            placeholder="请输入当前密码"
          />
          <BaseInput
            v-model="passwordForm.new"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            hint="密码长度至少 8 位，包含字母和数字"
          />
          <BaseInput
            v-model="passwordForm.confirm"
            type="password"
            label="确认新密码"
            placeholder="请再次输入新密码"
            :error="passwordForm.new !== passwordForm.confirm && passwordForm.confirm ? '两次输入的密码不一致' : ''"
          />
          <div class="pt-2">
            <BaseButton type="submit" :loading="updatingPassword" :disabled="!isPasswordValid">
              更新密码
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="pt-8 border-t border-[var(--border-color)]">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-[var(--text-color)]">两步验证 (2FA)</h4>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">
              开启后，登录时需要输入手机验证码，提高账户安全性。
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
        <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">最近登录记录</h4>
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-[var(--border-color)]">
            <thead class="bg-[var(--muted-bg)]">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[var(--text-color)] sm:pl-6">设备</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">IP 地址</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">时间</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-[var(--text-color)]">状态</th>
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
                  <span class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">成功</span>
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

const toast = useToast()

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
  toast.success('密码修改成功')
}

const toggle2FA = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  toast.success(twoFactorEnabled.value ? '两步验证已开启' : '两步验证已关闭')
}
</script>

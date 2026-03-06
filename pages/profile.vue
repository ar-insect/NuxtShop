<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">个人中心</h1>
    </div>
    <div class="lg:grid lg:grid-cols-12 lg:gap-x-8">
      <!-- Sidebar -->
      <aside class="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3 space-y-4">
        <BaseCard class="overflow-hidden">
          <nav class="space-y-1">
            <a
              v-for="item in navigation"
              :key="item.name"
              :href="item.href"
              :class="[
                'group px-3 py-4 flex items-center text-sm font-medium transition-colors duration-200 cursor-pointer -mx-4 -my-1 border-l-4',
                item.current
                  ? ''
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-color)]',
              ]"
              :style="item.current ? {
                  backgroundColor: 'color-mix(in srgb, var(--primary-color), transparent 90%)',
                  borderColor: 'var(--primary-color)',
                  color: 'var(--primary-color)'
              } : {}"
              @click.prevent="currentTab = item.id"
            >
              <component
                :is="item.icon"
                :class="[
                  'flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors duration-200',
                   item.current ? '' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-secondary)]'
                ]"
                :style="item.current ? { color: 'var(--primary-color)' } : {}"
                aria-hidden="true"
              />
              <span class="truncate">{{ item.name }}</span>
            </a>
          </nav>
        </BaseCard>
        
        <BaseCard>
             <BaseButton
                block
                variant="danger"
                class="flex items-center justify-center"
                @click="logout"
              >
                <ArrowRightOnRectangleIcon
                  class="flex-shrink-0 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                退出登录
              </BaseButton>
        </BaseCard>
      </aside>

      <!-- Main Content -->
      <div class="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
        <BaseCard v-if="currentTab === 'account'" title="基本信息">
            <!-- Basic Info Content -->
            <div class="py-2">
                <div class="flex flex-col sm:flex-row items-start gap-8">
                    <!-- Avatar -->
                    <div class="relative group flex-shrink-0">
                        <img
                            :src="form.avatar || user?.avatar || 'https://via.placeholder.com/150'"
                            alt="User Avatar"
                            class="h-28 w-28 rounded-full object-cover ring-4 ring-[var(--bg-color)] shadow-sm"
                        >
                         <div v-if="uploading" class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                             <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                             </svg>
                         </div>
                         <label for="avatar-upload" class="absolute bottom-1 right-1 bg-[var(--card-bg)] rounded-full p-2 shadow-md border border-[var(--border-color)] cursor-pointer hover:bg-[var(--hover-bg)] transition-colors">
                             <PencilIcon class="h-4 w-4 text-[var(--text-secondary)]" />
                         </label>
                         <input id="avatar-upload" type="file" class="hidden" accept="image/*" :disabled="uploading" @change="handleFileUpload" >
                    </div>
                    
                    <!-- Details -->
                    <div class="flex-1 space-y-6 w-full pt-2">
                        <div class="flex items-center gap-3 group h-10">
                             <div v-if="!isEditingName" class="flex items-center gap-2">
                               <h2 class="text-2xl font-bold text-[var(--text-color)]">{{ form.name || '未设置姓名' }}</h2>
                               <button class="text-teal-500 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" @click="isEditingName = true">
                                   <PencilSquareIcon class="h-5 w-5" />
                               </button>
                             </div>
                             <div v-else class="flex items-center gap-2 w-full max-w-md">
                               <BaseInput 
                                 ref="nameInput" 
                                 v-model="form.name"
                                 class="flex-1"
                                 @keyup.enter="saveName"
                               />
                               <BaseButton size="sm" @click="saveName">保存</BaseButton>
                               <BaseButton size="sm" variant="ghost" @click="cancelEditName">取消</BaseButton>
                             </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                            <div class="flex flex-col">
                                <span class="text-[var(--text-secondary)] mb-1">会员等级：</span>
                                <span class="text-[var(--text-color)] font-medium inline-flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-yellow-400"/>
                                    黄金会员
                                </span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[var(--text-secondary)] mb-1">累计积分：</span>
                                <span class="text-[var(--text-color)] font-medium">2,345</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[var(--text-secondary)] mb-1">注册时间：</span>
                                <span class="text-[var(--text-color)] font-medium">2023-01-15</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             <!-- Wallet/Assets Info -->
             <div class="-mx-4 -mb-5 sm:-mx-6 sm:-mb-6 mt-8 px-4 py-6 border-t border-[var(--border-color)] sm:px-8 bg-[var(--muted-bg)]">
                <h3 class="text-base font-medium text-[var(--text-color)] mb-6">我的钱包</h3>
                
                <div class="space-y-6">
                    <!-- Balance -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="space-y-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-teal-500 text-white">
                                账户余额：¥ 1,280.00
                            </span>
                            <p class="text-sm text-[var(--text-secondary)] mt-1">
                                当前账户可用余额，可直接用于下单支付
                            </p>
                        </div>
                        <BaseButton size="sm" variant="outline">充值</BaseButton>
                    </div>

                     <!-- Coupons -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--border-color)] pt-6">
                        <div class="space-y-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-rose-500 text-white">
                                优惠券：12 张
                            </span>
                            <p class="text-sm text-[var(--text-secondary)] mt-1">
                                未使用优惠券，下单时自动抵扣
                            </p>
                        </div>
                        <BaseButton size="sm" variant="outline">查看</BaseButton>
                    </div>
                </div>
            </div>
        </BaseCard>
        
        <BaseCard v-else-if="currentTab === 'address'" title="收货地址">
          <div class="py-2 space-y-6">
            <div class="flex justify-end">
              <BaseButton size="sm" @click="openAddressModal()">
                <PlusIcon class="h-4 w-4 mr-1" />
                新增地址
              </BaseButton>
            </div>
            
            <div class="grid gap-4 sm:grid-cols-2">
              <div 
                v-for="address in addresses" 
                :key="address.id" 
                class="relative border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-color)]/50 hover:shadow-sm transition-all"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-[var(--text-color)]">{{ address.name }}</span>
                      <span class="text-sm text-[var(--text-secondary)]">{{ address.phone }}</span>
                      <span v-if="address.isDefault" class="px-1.5 py-0.5 rounded text-xs bg-teal-100 text-teal-800">默认</span>
                    </div>
                    <p class="mt-2 text-sm text-[var(--text-secondary)]">{{ address.detail }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="text-[var(--text-secondary)] hover:text-[var(--primary-color)]" @click="openAddressModal(address)">
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button class="text-[var(--text-secondary)] hover:text-red-500" @click="deleteAddress(address.id)">
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-else-if="currentTab === 'security'" title="安全设置">
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

        <BaseCard v-else-if="currentTab === 'preference'" title="偏好设置">
          <div class="py-2 space-y-8">
             <div>
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">外观主题</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                      v-for="theme in themes" 
                      :key="theme.value"
                      :class="[
                        'cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 transition-all',
                        currentTheme === theme.value 
                          ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/10' 
                          : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                      ]"
                      @click="setTheme(theme.value)"
                    >
                        <component :is="theme.icon" class="h-8 w-8 text-[var(--text-secondary)]" />
                        <span class="text-sm font-medium text-[var(--text-color)]">{{ theme.label }}</span>
                    </div>
                </div>
             </div>

             <div class="pt-8 border-t border-[var(--border-color)]">
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">字体大小</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="size in fontSizes"
                    :key="size.value"
                    type="button"
                    class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
                    :class="currentFontSize === size.value ? 'bg-[var(--primary-color)]/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5'"
                    :style="{
                      borderColor: currentFontSize === size.value ? 'var(--primary-color)' : 'var(--border-color)',
                      color: currentFontSize === size.value ? 'var(--primary-color)' : 'var(--text-secondary)'
                    }"
                    @click="setFontSize(size.value)"
                  >
                    {{ size.label }}
                  </button>
                </div>
             </div>

             <div class="pt-8 border-t border-[var(--border-color)]">
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">主题色</h4>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="color in colors"
                    :key="color"
                    type="button"
                    class="h-9 w-9 rounded-full border transition-transform active:scale-95"
                    :style="{
                      backgroundColor: color,
                      borderColor: currentPrimaryColor === color ? 'var(--text-color)' : 'var(--border-color)',
                      transform: currentPrimaryColor === color ? 'scale(1.05)' : undefined
                    }"
                    @click="setPrimaryColor(color)"
                  />
                </div>
             </div>

             <div class="pt-8 border-t border-[var(--border-color)]">
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">圆角</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="radius in radii"
                    :key="radius.value"
                    type="button"
                    class="px-3 py-2 text-sm rounded-md border transition-colors text-center"
                    :class="currentBorderRadius === radius.value ? 'bg-[var(--primary-color)]/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5'"
                    :style="{
                      borderColor: currentBorderRadius === radius.value ? 'var(--primary-color)' : 'var(--border-color)',
                      color: currentBorderRadius === radius.value ? 'var(--primary-color)' : 'var(--text-secondary)'
                    }"
                    @click="setBorderRadius(radius.value)"
                  >
                    {{ radius.label }}
                  </button>
                </div>
             </div>

             <div class="pt-8 border-t border-[var(--border-color)]">
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">语言设置</h4>
                <div class="max-w-xs">
                    <BaseSelect 
                      v-model="currentLanguage"
                      :options="[
                        { label: '简体中文 (Chinese Simplified)', value: 'zh-CN' },
                        { label: 'English (US)', value: 'en-US' }
                      ]"
                    />
                </div>
             </div>

             <!-- Timezone -->
             <div class="pt-8 border-t border-[var(--border-color)]">
                <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">时区</h4>
                <div class="max-w-xs">
                    <BaseSelect 
                      v-model="currentTimezone"
                      :options="[
                        { label: 'Asia/Shanghai (GMT+08:00)', value: 'Asia/Shanghai' },
                        { label: 'UTC (GMT+00:00)', value: 'UTC' },
                        { label: 'America/New_York (GMT-05:00)', value: 'America/New_York' }
                      ]"
                    />
                </div>
             </div>

             <div class="pt-8 border-t border-[var(--border-color)] flex justify-end">
                <BaseButton variant="outline" @click="resetTheme">恢复默认外观</BaseButton>
             </div>
          </div>
        </BaseCard>

        <BaseCard v-else-if="currentTab === 'notification'" title="接收设置">
           <div class="py-2 space-y-6">
              <div v-for="(group, index) in notificationSettings" :key="index" :class="index > 0 ? 'pt-6 border-t border-[var(--border-color)]' : ''">
                  <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">{{ group.title }}</h4>
                  <div class="space-y-4">
                      <div v-for="item in group.items" :key="item.id" class="flex items-start">
                          <div class="flex items-center h-5">
                            <input
                              :id="item.id"
                              v-model="item.enabled"
                              :name="item.id"
                              type="checkbox"
                              class="focus:outline-none h-4 w-4 text-teal-600 border-gray-300 rounded"
                            >
                          </div>
                          <div class="ml-3 text-sm">
                            <label :for="item.id" class="font-medium text-[var(--text-color)]">{{ item.label }}</label>
                            <p class="text-[var(--text-secondary)]">{{ item.description }}</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div class="pt-6 border-t border-[var(--border-color)] flex justify-end">
                  <BaseButton :loading="savingNotifications" @click="saveNotifications">保存更改</BaseButton>
              </div>
           </div>
        </BaseCard>
        
        <!-- Other Tabs Placeholder -->
        <BaseCard v-else class="text-center py-12">
            <div class="mx-auto h-12 w-12 text-[var(--text-secondary)] flex justify-center">
                <component :is="navigation.find(i => i.id === currentTab)?.icon" class="h-12 w-12" />
            </div>
            <h3 class="mt-2 text-sm font-medium text-[var(--text-color)]">功能开发中</h3>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">此模块尚未完成，敬请期待。</p>
        </BaseCard>
      </div>
    </div>

    <!-- Image Cropper Modal -->
    <ClientOnly>
      <ImageCropper
        v-model:visible="showCropper"
        :src="cropperImage"
        @crop="handleCrop"
      />
    </ClientOnly>

    <!-- Address Modal -->
    <BaseModal v-model="isAddressModalOpen" :title="addressForm.id ? '编辑地址' : '新增地址'">
      <div class="space-y-4">
        <BaseInput v-model="addressForm.name" label="收货人" placeholder="请输入收货人姓名" />
        <BaseInput v-model="addressForm.phone" label="联系电话" placeholder="请输入联系电话" />
        <BaseInput v-model="addressForm.detail" label="详细地址" placeholder="街道、门牌号等" />
        <div class="flex items-center">
          <input
            id="is-default"
            v-model="addressForm.isDefault"
            type="checkbox"
            class="h-4 w-4 text-[var(--primary-color)] focus:outline-none border-gray-300 rounded"
          >
          <label for="is-default" class="ml-2 block text-sm text-[var(--text-color)]">
            设为默认地址
          </label>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="isAddressModalOpen = false">取消</BaseButton>
          <BaseButton @click="saveAddress">保存</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  Cog6ToothIcon, 
  BellIcon,
  ShoppingBagIcon,
  PencilIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import BaseSelect from '~/components/ui/BaseSelect.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user, logout } = useAuth()
const themeStore = useThemeStore()
const toast = useToast()
const { confirm } = useConfirm()

useSeoMeta({
  title: '个人中心',
  description: '管理您的个人资料和账户设置。'
})

// Navigation
const currentTab = ref('account')
const navigation = reactive([
  { id: 'account', name: '账号信息', href: '#', icon: UserCircleIcon, current: true },
  { id: 'orders', name: '我的订单', href: '#', icon: ShoppingBagIcon, current: false },
  { id: 'address', name: '收货地址', href: '#', icon: MapPinIcon, current: false },
  { id: 'security', name: '安全设置', href: '#', icon: ShieldCheckIcon, current: false },
  { id: 'preference', name: '偏好设置', href: '#', icon: Cog6ToothIcon, current: false },
  { id: 'notification', name: '接收设置', href: '#', icon: BellIcon, current: false },
])

// Address Management
interface Address {
  id: string
  name: string
  phone: string
  detail: string
  isDefault: boolean
}

const addresses = ref<Address[]>([
  { id: '1', name: '张三', phone: '13800138000', detail: '上海市浦东新区陆家嘴环路1000号', isDefault: true }
])
const isAddressModalOpen = ref(false)
const addressForm = reactive({
  id: '',
  name: '',
  phone: '',
  detail: '',
  isDefault: false
})

const openAddressModal = (address?: Address) => {
  if (address) {
    Object.assign(addressForm, address)
  } else {
    Object.assign(addressForm, { id: '', name: '', phone: '', detail: '', isDefault: false })
  }
  isAddressModalOpen.value = true
}

const saveAddress = () => {
  if (addressForm.id) {
    const index = addresses.value.findIndex(a => a.id === addressForm.id)
    if (index > -1) addresses.value[index] = { ...addressForm }
  } else {
    addresses.value.push({ ...addressForm, id: Date.now().toString() })
  }
  
  if (addressForm.isDefault) {
    addresses.value.forEach(a => {
      if (a.id !== (addressForm.id || addresses.value[addresses.value.length - 1].id)) {
        a.isDefault = false
      }
    })
  }
  
  isAddressModalOpen.value = false
  toast.success('地址保存成功')
}

const deleteAddress = async (id: string) => {
  const isConfirmed = await confirm({
    title: '删除地址',
    message: '确定要删除这个收货地址吗？',
    type: 'warning',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (isConfirmed) {
    addresses.value = addresses.value.filter(a => a.id !== id)
    toast.success('地址已删除')
  }
}

// 将收货地址持久化到 localStorage
if (import.meta.client) {
  const savedAddresses = localStorage.getItem('nuxt-shop-addresses')
  if (savedAddresses) {
    try {
      addresses.value = JSON.parse(savedAddresses)
    } catch (e) {
      console.error('Failed to parse addresses', e)
    }
  }
  
  watch(addresses, (newVal) => {
    localStorage.setItem('nuxt-shop-addresses', JSON.stringify(newVal))
  }, { deep: true })
}


// 安全设置状态
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

// 偏好设置状态
const userId = computed(() => user.value?.id?.toString())
const themes = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'system', label: '跟随系统', icon: ComputerDesktopIcon },
]
const currentTheme = computed(() => themeStore.theme.mode)
const currentFontSize = computed(() => themeStore.theme.fontSize)
const currentPrimaryColor = computed(() => themeStore.theme.primaryColor)
const currentBorderRadius = computed(() => themeStore.theme.borderRadius)
const currentLanguage = ref('zh-CN')
const currentTimezone = ref('Asia/Shanghai')

const setTheme = (mode: string) => {
  themeStore.updateTheme({ mode: mode as any }, userId.value)
}

const fontSizes = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
  { label: '特大', value: 'xl' }
] as const

const colors = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899'
]

const radii = [
  { label: '直角', value: '0px' },
  { label: '小圆角', value: '0.25rem' },
  { label: '中圆角', value: '0.5rem' },
  { label: '大圆角', value: '1rem' }
]

const setFontSize = (size: typeof fontSizes[number]['value']) => {
  themeStore.updateTheme({ fontSize: size }, userId.value)
}

const setPrimaryColor = (color: string) => {
  themeStore.updateTheme({ primaryColor: color }, userId.value)
}

const setBorderRadius = (radius: string) => {
  themeStore.updateTheme({ borderRadius: radius }, userId.value)
}

const resetTheme = () => {
  themeStore.resetTheme(userId.value)
}

// Notification Settings State
const savingNotifications = ref(false)
const notificationSettings = reactive([
  {
    title: '订单通知',
    items: [
      { id: 'order_created', label: '订单创建', description: '当下单成功时通知我', enabled: true },
      { id: 'order_shipped', label: '发货提醒', description: '当商品发货时通知我', enabled: true },
      { id: 'order_delivered', label: '送达通知', description: '当商品送达时通知我', enabled: true },
    ]
  },
  {
    title: '营销推广',
    items: [
      { id: 'promo_email', label: '邮件订阅', description: '接收最新的优惠活动和产品资讯', enabled: false },
      { id: 'promo_sms', label: '短信通知', description: '接收重要的促销信息短信', enabled: false },
    ]
  }
])

const saveNotifications = async () => {
  savingNotifications.value = true
  // 模拟 API 请求
  await new Promise(resolve => setTimeout(resolve, 800))
  savingNotifications.value = false
  toast.success('通知设置已保存')
}

const router = useRouter()

// 根据当前选中项更新导航状态
watch(currentTab, (val) => {
  navigation.forEach(item => {
    item.current = item.id === val
  })
  
  if (val === 'orders') {
    router.push('/orders')
  }
})

const uploading = ref(false)
const saving = ref(false)
const showCropper = ref(false)
const cropperImage = ref('')
const isEditingName = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: user.value?.name || '',
  avatar: user.value?.avatar || ''
})

// 用户数据加载/刷新后同步表单内容
watch(user, (newUser) => {
  if (newUser) {
    form.name = newUser.name
    form.avatar = newUser.avatar
  }
}, { immediate: true })

// 开始编辑时自动聚焦输入框
watch(isEditingName, (val) => {
    if (val) {
        nextTick(() => {
            nameInput.value?.focus()
        })
    }
})

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  // 校验文件类型
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      cropperImage.value = e.target.result as string
      showCropper.value = true
    }
  }
  reader.readAsDataURL(file)
  
  // 清空 input 值，允许再次选择同一个文件
  input.value = ''
}

const handleCrop = async (blob: Blob) => {
  const formData = new FormData()
  formData.append('file', blob, 'avatar.jpg')

  uploading.value = true
  try {
    const response = await $fetch<{ data: { url: string } }>('/api/upload', {
      method: 'POST',
      body: formData
    })
    form.avatar = response.data.url
    // 裁剪/上传后立即保存头像
    await saveProfile()
  } catch (error) {
    alert('头像上传失败')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const saveName = async () => {
    await saveProfile()
    isEditingName.value = false
}

const cancelEditName = () => {
    form.name = user.value?.name || ''
    isEditingName.value = false
}

const saveProfile = async () => {
  saving.value = true
  try {
    await $fetch<{ data: any }>('/api/user/update', {
      method: 'POST',
      body: {
        name: form.name,
        avatar: form.avatar
      }
    })
    // 需要时同步更新本地 user 状态
    // 真实项目中可由后端下发最新用户信息，或 useAuth 内部做统一刷新
    // user.value.name = form.name ...（取决于 useAuth 的实现）
    // 这里先采用最简单的本地更新：
    if (user.value) {
        user.value.name = form.name
        user.value.avatar = form.avatar
    }
  } catch (error) {
    alert('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>

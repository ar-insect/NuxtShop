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
        <ProfileAccount v-if="currentTab === 'account'" />
        
        <ProfileAddress v-else-if="currentTab === 'address'" />

        <ProfileSecurity v-else-if="currentTab === 'security'" />

        <ProfilePreferences v-else-if="currentTab === 'preference'" />

        <ProfileNotifications v-else-if="currentTab === 'notification'" />
        
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
  </div>
</template>

<script setup lang="ts">
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  Cog6ToothIcon, 
  BellIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import ProfileAccount from '~/components/profile/ProfileAccount.vue'
import ProfileAddress from '~/components/profile/ProfileAddress.vue'
import ProfileSecurity from '~/components/profile/ProfileSecurity.vue'
import ProfilePreferences from '~/components/profile/ProfilePreferences.vue'
import ProfileNotifications from '~/components/profile/ProfileNotifications.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { logout } = useAuth()

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
</script>

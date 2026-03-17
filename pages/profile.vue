<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">{{ t('profile.title') }}</h1>
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
                item.id === currentTab
                  ? ''
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-color)]',
              ]"
              :style="item.id === currentTab ? {
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
                   item.id === currentTab ? '' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-secondary)]'
                ]"
                :style="item.id === currentTab ? { color: 'var(--primary-color)' } : {}"
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
            @click="handleLogout"
          >
            <ArrowRightOnRectangleIcon
              class="flex-shrink-0 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            {{ t('profile.logoutConfirm') }}
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
            <h3 class="mt-2 text-sm font-medium text-[var(--text-color)]">
              {{ t('profile.placeholderTitle') }}
            </h3>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">{{ t('profile.placeholderDesc') }}</p>
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
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { logout } = useAuth()
const { confirm } = useConfirm()
const { t } = useI18n()

useSeoMeta({
  title: t('profile.seoTitle'),
  description: t('profile.seoDesc')
})

// Navigation
const currentTab = ref('account')
const navigation = computed(() => ([
  { id: 'account', name: t('profile.nav.account'), href: '#', icon: UserCircleIcon },
  { id: 'orders', name: t('profile.nav.orders'), href: '#', icon: ShoppingBagIcon },
  { id: 'address', name: t('profile.nav.address'), href: '#', icon: MapPinIcon },
  { id: 'security', name: t('profile.nav.security'), href: '#', icon: ShieldCheckIcon },
  { id: 'preference', name: t('profile.nav.preference'), href: '#', icon: Cog6ToothIcon },
  { id: 'notification', name: t('profile.nav.notification'), href: '#', icon: BellIcon },
]))

const router = useRouter()

const handleLogout = async () => {
  const ok = await confirm({
    title: t('profile.logoutTitle'),
    message: t('profile.logoutMessage'),
    type: 'danger',
    confirmText: t('profile.logoutConfirm'),
    cancelText: t('profile.logoutCancel')
  })

  if (ok) {
    logout()
  }
}

watch(currentTab, (val) => {
  if (val === 'orders') {
    router.push('/orders')
  }
})
</script>

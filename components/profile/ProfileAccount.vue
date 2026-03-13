<template>
  <BaseCard :title="t('profile.account.title')">
    <div class="py-2">
      <div class="flex flex-col sm:flex-row items-start gap-8">
        <!-- Avatar -->
        <div class="relative group flex-shrink-0">
          <img
            v-if="avatarSrc"
            :src="avatarSrc"
            alt="User Avatar"
            class="h-28 w-28 rounded-full object-cover ring-4 ring-[var(--bg-color)] shadow-sm"
          >
          <div
            v-else
            class="h-28 w-28 rounded-full ring-4 ring-[var(--bg-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center text-2xl font-semibold bg-[var(--card-bg)] text-[var(--text-color)]"
          >
            {{ displayInitial }}
          </div>
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
              <h2 class="text-2xl font-bold text-[var(--text-color)]">
                {{ form.name || t('profile.account.nameUnset') }}
              </h2>
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
              <BaseButton size="sm" class="whitespace-nowrap" @click="saveName">
                {{ t('profile.account.save') }}
              </BaseButton>
              <BaseButton size="sm" variant="ghost" class="whitespace-nowrap" @click="cancelEditName">
                {{ t('profile.account.cancel') }}
              </BaseButton>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 text-sm">
            <div class="flex flex-col">
              <span class="text-[var(--text-secondary)] mb-1">
                {{ t('profile.account.levelLabel') }}
              </span>
              <span class="text-[var(--text-color)] font-medium inline-flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-yellow-400"/>
                {{ t('profile.account.levelGold') }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-[var(--text-secondary)] mb-1">
                {{ t('profile.account.pointsLabel') }}
              </span>
              <span class="text-[var(--text-color)] font-medium">2,345</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[var(--text-secondary)] mb-1">
                {{ t('profile.account.phoneLabel') }}
              </span>
              <div class="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 max-w-sm sm:max-w-md">
                <div v-if="!isEditingPhone" class="flex items-center gap-2">
                  <span class="text-[var(--text-color)]">
                    {{ form.phone || t('profile.account.phoneUnset') }}
                  </span>
                  <button
                    class="text-teal-500 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    @click="isEditingPhone = true"
                  >
                    <PencilSquareIcon class="h-4 w-4" />
                  </button>
                </div>
                <div v-else class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  <BaseInput
                    ref="phoneInput"
                    v-model="form.phone"
                    :error="phoneError"
                    placeholder="请输入手机号"
                    class="flex-1"
                    @keyup.enter="savePhone"
                  />
                  <div class="flex items-center gap-2">
                    <BaseButton size="sm" :loading="saving" class="whitespace-nowrap" @click="savePhone">
                      {{ t('profile.account.save') }}
                    </BaseButton>
                    <BaseButton size="sm" variant="ghost" class="whitespace-nowrap" @click="cancelEditPhone">
                      {{ t('profile.account.cancel') }}
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wallet/Assets Info -->
    <div class="-mx-4 -mb-5 sm:-mx-6 sm:-mb-6 mt-8 px-4 py-6 border-t border-[var(--border-color)] sm:px-8 bg-[var(--muted-bg)]">
      <h3 class="text-base font-medium text-[var(--text-color)] mb-6">
        {{ t('profile.account.walletTitle') }}
      </h3>
      
      <div class="space-y-6">
        <!-- Balance -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-teal-500 text-white">
              {{ t('profile.account.balanceLabel') }} ¥ 1,280.00
            </span>
            <p class="text-sm text-[var(--text-secondary)] mt-1">
              {{ t('profile.account.balanceDesc') }}
            </p>
          </div>
          <BaseButton size="sm" variant="outline">
            {{ t('profile.account.recharge') }}
          </BaseButton>
        </div>

        <!-- Coupons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--border-color)] pt-6">
          <div class="space-y-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-rose-500 text-white">
              {{ t('profile.account.couponLabel') }} 12
            </span>
            <p class="text-sm text-[var(--text-secondary)] mt-1">
              {{ t('profile.account.couponDesc') }}
            </p>
          </div>
          <BaseButton size="sm" variant="outline">
            {{ t('profile.account.view') }}
          </BaseButton>
        </div>
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
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { PencilIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import { validatePhone } from '~/utils/validation'
import { useI18n } from '~/composables/useI18n'

const { user } = useAuth()
const toast = useToast()
const { t } = useI18n()

const uploading = ref(false)
const saving = ref(false)
const showCropper = ref(false)
const cropperImage = ref('')
const isEditingName = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
const phoneError = ref('')
const isEditingPhone = ref(false)
const phoneInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: user.value?.name || '',
  avatar: user.value?.avatar || '',
  phone: user.value?.phone || ''
})

const avatarSrc = computed(() => form.avatar || user.value?.avatar || '')
const displayInitial = computed(() => {
  const base = form.name || user.value?.name || user.value?.username || 'U'
  return base.charAt(0).toUpperCase()
})

// 用户数据加载/刷新后同步表单内容
watch(user, (newUser) => {
  if (newUser) {
    form.name = newUser.name || ''
    form.avatar = newUser.avatar || ''
    form.phone = newUser.phone || ''
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

watch(isEditingPhone, (val) => {
  if (val) {
    nextTick(() => {
      phoneInput.value?.focus()
    })
  }
})

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    toast.error(t('profile.account.avatarTypeError'))
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
    toast.error('头像上传失败')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true;
  try {
    if (form.phone) {
      const err = validatePhone(form.phone)
      if (err) {
        toast.error(err)
        phoneError.value = err
        saving.value = false
        return
      }
      phoneError.value = ''
    } else {
      phoneError.value = ''
    }

    const response = await $fetch('/api/user/update', {
      method: 'POST',
      body: {
        name: form.name,
        avatar: form.avatar,
        phone: form.phone,
      },
    });
    // 更新 useAuth 中的用户状态
    if (user.value && response.data) {
      user.value.name = response.data.name;
      user.value.avatar = response.data.avatar;
      user.value.phone = response.data.phone;
    }
    toast.success('个人资料更新成功！');
  } catch (error: any) {
    toast.error(error.statusMessage || '个人资料更新失败');
    console.error('Error saving profile:', error);
  } finally {
    saving.value = false;
  }
};

const saveName = async () => {
  await saveProfile()
  isEditingName.value = false
}

const cancelEditName = () => {
  form.name = user.value?.name || ''
  isEditingName.value = false
}

const savePhone = async () => {
  await saveProfile()
  if (!phoneError.value) {
    isEditingPhone.value = false
  }
}

const cancelEditPhone = () => {
  form.phone = user.value?.phone || ''
  phoneError.value = ''
  isEditingPhone.value = false
}
</script>

<template>
  <BaseCard title="基本信息">
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

const { user } = useAuth()
const toast = useToast()

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
    toast.error('头像上传失败')
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
    if (user.value) {
      user.value.name = form.name
      user.value.avatar = form.avatar
    }
  } catch (error) {
    toast.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseCard :title="t('profile.address.title')">
    <div class="py-2 space-y-6">
      <div class="flex justify-end">
        <BaseButton size="sm" @click="openAddressModal()">
          <PlusIcon class="h-4 w-4 mr-1" />
          {{ t('profile.address.addButton') }}
        </BaseButton>
      </div>
      
      <div v-if="addresses && addresses.length > 0" class="grid gap-4 sm:grid-cols-2">
        <div 
          v-for="address in addresses" 
          :key="address._id" 
          class="relative border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-color)]/50 hover:shadow-sm transition-all"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-[var(--text-color)]">{{ address.name }}</span>
                <span class="text-sm text-[var(--text-secondary)]">{{ address.phone }}</span>
                <span
                  v-if="address.isDefault"
                  class="px-1.5 py-0.5 rounded text-xs bg-teal-100 text-teal-800"
                >
                  {{ t('profile.address.defaultTag') }}
                </span>
              </div>
              <p class="mt-2 text-sm text-[var(--text-secondary)]">{{ address.region }} {{ address.detail }}</p>
            </div>
            <div class="flex gap-2">
              <button class="text-[var(--text-secondary)] hover:text-[var(--primary-color)]" @click="openAddressModal(address)">
                <PencilIcon class="h-4 w-4" />
              </button>
              <button class="text-[var(--text-secondary)] hover:text-red-500" @click="deleteAddress(address._id)">
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-[var(--text-secondary)] py-8">
        <p>{{ t('profile.address.emptyLine1') }}</p>
        <p>{{ t('profile.address.emptyLine2') }}</p>
      </div>
    </div>

    <!-- Address Modal -->
    <BaseModal
      v-model="isAddressModalOpen"
      :title="addressForm._id ? t('profile.address.editTitle') : t('profile.address.addTitle')"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="addressForm.name"
          :label="t('profile.address.receiverLabel')"
          :placeholder="t('profile.address.receiverPlaceholder')"
        />
        <BaseInput
          v-model="addressForm.phone"
          :label="t('profile.address.phoneLabel')"
          :placeholder="t('profile.address.phonePlaceholder')"
        />
        <div>
          <label class="block text-sm font-medium text-[var(--text-color)] mb-1">
            {{ t('profile.address.regionLabel') }}
          </label>
          <RegionSelect v-model="addressForm.region" />
        </div>
        <BaseInput
          v-model="addressForm.detail"
          :label="t('profile.address.detailLabel')"
          :placeholder="t('profile.address.detailPlaceholder')"
        />
        <div class="flex items-center">
          <input
            id="is-default"
            v-model="addressForm.isDefault"
            type="checkbox"
            class="h-4 w-4 text-[var(--primary-color)] focus:outline-none border-gray-300 rounded"
          >
          <label for="is-default" class="ml-2 block text-sm text-[var(--text-color)]">
            {{ t('profile.address.setDefault') }}
          </label>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="isAddressModalOpen = false">
            {{ t('profile.address.cancel') }}
          </BaseButton>
          <BaseButton @click="saveAddress">
            {{ t('profile.address.save') }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import RegionSelect from '~/components/ui/RegionSelect.vue'
import type { Address as MongoAddress } from '~/types/address'
import { useI18n } from '~/composables/useI18n'

interface Address extends Omit<MongoAddress, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  _id: string; // 确保 _id 存在且为 string
  userId: string; // 确保 userId 存在且为 string
}

const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const { data: addresses, refresh: refreshAddresses } = await useAsyncData('user-addresses', () =>
  $fetch<{ code: number; message: string; data: Address[] }>('/api/user/addresses').then(res => res.data)
)

const isAddressModalOpen = ref(false)
const addressForm = reactive({
  _id: '', // MongoDB 的 _id
  name: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false
})

const phoneRegex = /^1[3-9]\d{9}$/

const isRegionComplete = (region: string) => {
  const parts = region.split(' ').filter(Boolean)
  return parts.length >= 3
}

const openAddressModal = (address?: Address) => {
  if (address) {
    Object.assign(addressForm, {
      _id: address._id,
      name: address.name,
      phone: address.phone,
      region: address.region,
      detail: address.detail,
      isDefault: address.isDefault
    })
  } else {
    Object.assign(addressForm, { _id: '', name: '', phone: '', region: '', detail: '', isDefault: false })
  }
  isAddressModalOpen.value = true
}

const saveAddress = async () => {
  if (!isRegionComplete(addressForm.region)) {
    toast.error(t('profile.address.regionError'))
    return
  }

  if (!phoneRegex.test(addressForm.phone)) {
    toast.error(t('validation.phoneInvalid'))
    return
  }

  try {
    if (addressForm._id) {
      // 更新地址
      await $fetch(`/api/user/addresses/${addressForm._id}`, {
        method: 'PUT',
        body: addressForm
      })
      toast.success(t('profile.address.updateSuccess'))
    } else {
      // 新增地址
      await $fetch('/api/user/addresses', {
        method: 'POST',
        body: addressForm
      })
      toast.success(t('profile.address.addSuccess'))
    }
    isAddressModalOpen.value = false
    await refreshAddresses() // 刷新地址列表
  } catch (error: any) {
    toast.error(error.statusMessage || t('profile.address.saveFailed'))
    console.error('Error saving address:', error)
  }
}

const deleteAddress = async (id: string) => {
  const isConfirmed = await confirm({
    title: t('profile.address.deleteTitle'),
    message: t('profile.address.deleteMessage'),
    type: 'warning',
    confirmText: t('profile.address.deleteConfirm'),
    cancelText: t('profile.address.deleteCancel')
  })

  if (isConfirmed) {
    try {
      await $fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE'
      })
      toast.success(t('profile.address.deleteSuccess'))
      await refreshAddresses() // 刷新地址列表
    } catch (error: any) {
      toast.error(error.statusMessage || t('profile.address.deleteFailed'))
      console.error('Error deleting address:', error)
    }
  }
}

// 监听 isDefault 变化，如果设置为 true，则调用 API 设置默认地址
watch(() => addressForm.isDefault, async (newVal) => {
  if (newVal && addressForm._id) {
    try {
      await $fetch(`/api/user/addresses/${addressForm._id}/default`, {
        method: 'PUT'
      })
      await refreshAddresses() // 刷新地址列表
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }
})
</script>

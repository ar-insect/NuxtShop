<template>
  <BaseCard title="收货地址">
    <div class="py-2 space-y-6">
      <div class="flex justify-end">
        <BaseButton size="sm" @click="openAddressModal()">
          <PlusIcon class="h-4 w-4 mr-1" />
          新增地址
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
                <span v-if="address.isDefault" class="px-1.5 py-0.5 rounded text-xs bg-teal-100 text-teal-800">默认</span>
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
        <p>您还没有添加收货地址。</p>
        <p>点击“新增地址”开始添加吧！</p>
      </div>
    </div>

    <!-- Address Modal -->
    <BaseModal v-model="isAddressModalOpen" :title="addressForm._id ? '编辑地址' : '新增地址'">
      <div class="space-y-4">
        <BaseInput v-model="addressForm.name" label="收货人" placeholder="请输入收货人姓名" />
        <BaseInput v-model="addressForm.phone" label="联系电话" placeholder="请输入联系电话" />
        <div>
          <label class="block text-sm font-medium text-[var(--text-color)] mb-1">省市区</label>
          <RegionSelect v-model="addressForm.region" />
        </div>
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
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import RegionSelect from '~/components/ui/RegionSelect.vue'
import type { Address as MongoAddress } from '~/types/address' // 导入 MongoDB 的 Address 类型

interface Address extends Omit<MongoAddress, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  _id: string; // 确保 _id 存在且为 string
  userId: string; // 确保 userId 存在且为 string
}

const toast = useToast()
const { confirm } = useConfirm()

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
    toast.error('请选择完整的省、市、区')
    return
  }

  if (!phoneRegex.test(addressForm.phone)) {
    toast.error('请输入有效的11位手机号码')
    return
  }

  try {
    if (addressForm._id) {
      // 更新地址
      await $fetch(`/api/user/addresses/${addressForm._id}`, {
        method: 'PUT',
        body: addressForm
      })
      toast.success('地址更新成功')
    } else {
      // 新增地址
      await $fetch('/api/user/addresses', {
        method: 'POST',
        body: addressForm
      })
      toast.success('地址添加成功')
    }
    isAddressModalOpen.value = false
    await refreshAddresses() // 刷新地址列表
  } catch (error: any) {
    toast.error(error.statusMessage || '保存地址失败')
    console.error('Error saving address:', error)
  }
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
    try {
      await $fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE'
      })
      toast.success('地址已删除')
      await refreshAddresses() // 刷新地址列表
    } catch (error: any) {
      toast.error(error.statusMessage || '删除地址失败')
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

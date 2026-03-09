<template>
  <BaseCard title="收货地址">
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

    <!-- Address Modal -->
    <BaseModal v-model="isAddressModalOpen" :title="addressForm.id ? '编辑地址' : '新增地址'">
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

const toast = useToast()
const { confirm } = useConfirm()

interface Address {
  id: string
  name: string
  phone: string
  detail: string
  isDefault: boolean
}

const addresses = ref<Address[]>([
  { id: '1', name: '张三', phone: '13800138000', detail: '上海市 上海市 浦东新区 陆家嘴环路1000号', isDefault: true }
])
const isAddressModalOpen = ref(false)
const addressForm = reactive({
  id: '',
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
    let region = ''
    let detail = address.detail
    const parts = address.detail.split(' ')
    if (parts.length >= 4) {
      region = parts.slice(0, 3).join(' ')
      detail = parts.slice(3).join(' ')
    }
    Object.assign(addressForm, {
      id: address.id,
      name: address.name,
      phone: address.phone,
      region,
      detail,
      isDefault: address.isDefault
    })
  } else {
    Object.assign(addressForm, { id: '', name: '', phone: '', region: '', detail: '', isDefault: false })
  }
  isAddressModalOpen.value = true
}

const saveAddress = () => {
  if (!isRegionComplete(addressForm.region)) {
    toast.error('请选择完整的省、市、区')
    return
  }

  if (!phoneRegex.test(addressForm.phone)) {
    toast.error('请输入有效的11位手机号码')
    return
  }

  const fullDetail = addressForm.region
    ? `${addressForm.region} ${addressForm.detail}`.trim()
    : addressForm.detail

  let currentId = addressForm.id
  if (addressForm.id) {
    const index = addresses.value.findIndex(a => a.id === addressForm.id)
    if (index > -1) {
      addresses.value[index] = {
        id: addressForm.id,
        name: addressForm.name,
        phone: addressForm.phone,
        detail: fullDetail,
        isDefault: addressForm.isDefault
      }
    }
  } else {
    currentId = Date.now().toString()
    addresses.value.push({
      id: currentId,
      name: addressForm.name,
      phone: addressForm.phone,
      detail: fullDetail,
      isDefault: addressForm.isDefault
    })
  }
  
  if (addressForm.isDefault) {
    addresses.value.forEach(a => {
      if (a.id !== currentId) {
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
</script>

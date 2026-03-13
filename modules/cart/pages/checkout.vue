<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
      <div class="lg:col-span-7">
        <BaseCard title="收货地址">
          <div class="p-6 space-y-6">
            <!-- Saved Addresses -->
            <div v-if="savedAddresses.length > 0" class="grid gap-4 sm:grid-cols-2 mb-6">
              <div 
                v-for="address in savedAddresses" 
                :key="address.id" 
                class="relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm"
                :class="selectedAddressId === address.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 ring-1 ring-[var(--primary-color)]' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'"
                @click="selectAddress(address)"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-[var(--text-color)]">{{ address.name }}</span>
                      <span v-if="address.isDefault" class="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">默认</span>
                      <span class="text-sm text-[var(--text-secondary)]">{{ address.phone }}</span>
                    </div>
                    <p class="mt-2 text-sm text-[var(--text-secondary)]">{{ address.detail }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="删除地址"
                      @click="(e) => deleteAddress(e, address.id)"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                    <div v-if="selectedAddressId === address.id" class="text-[var(--primary-color)]">
                      <CheckCircleIcon class="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Add New Address Button -->
              <div 
                class="flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-lg p-4 cursor-pointer hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors min-h-[100px]"
                :class="isNewAddressMode ? 'border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'text-[var(--text-secondary)]'"
                @click="isNewAddressMode = true; selectedAddressId = ''"
              >
                <PlusIcon class="h-6 w-6 mb-1" />
                <span class="text-sm font-medium">使用新地址</span>
              </div>
            </div>

            <!-- New Address Form -->
            <div v-if="isNewAddressMode || savedAddresses.length === 0" class="border-t border-[var(--border-color)] pt-6">
              <h4 class="text-sm font-medium text-[var(--text-color)] mb-4">填写新地址</h4>
              <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <BaseInput v-model="form.firstName" label="姓氏" placeholder="例如：张" />
                </div>
                <div>
                  <BaseInput v-model="form.lastName" label="名字" placeholder="例如：三" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-[var(--text-color)] mb-1">省市区</label>
                  <RegionSelect v-model="form.region" />
                </div>
                <div class="sm:col-span-2">
                  <BaseInput v-model="form.address" label="详细地址" placeholder="街道、门牌号等" />
                </div>
                <div>
                  <BaseInput v-model="form.postalCode" label="邮政编码" placeholder="例如：200000" />
                </div>
                <div class="sm:col-span-2">
                  <BaseInput v-model="form.phone" label="联系电话" placeholder="用于接收配送通知" />
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="支付方式" class="mt-8">
          <div class="p-6">
            <div class="space-y-4">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                :class="selectedPayment === method.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'"
                @click="selectedPayment = method.id"
              >
                <input 
                  :id="method.id" 
                  v-model="selectedPayment" 
                  type="radio" 
                  name="payment-method"
                  :value="method.id"
                  class="h-4 w-4 text-[var(--primary-color)] focus:outline-none border-gray-300"
                >
                <label :for="method.id" class="ml-3 block text-sm font-medium text-[var(--text-color)] cursor-pointer flex-1">
                  {{ method.name }}
                </label>
                <component :is="method.icon" class="h-6 w-6 text-[var(--text-secondary)]" />
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Order Summary -->
      <div class="mt-10 lg:mt-0 lg:col-span-5">
        <BaseCard title="订单摘要" class="sticky top-6">
          <div class="p-6">
            <ul role="list" class="divide-y divide-[var(--border-color)]">
              <li v-for="item in cartItems" :key="item.id" class="flex py-6">
                <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] p-2">
                  <img :src="item.image" :alt="item.title" class="h-full w-full object-contain object-center" >
                </div>

                <div class="ml-4 flex flex-1 flex-col">
                  <div>
                    <div class="flex justify-between text-base font-medium text-[var(--text-color)]">
                      <h3 class="line-clamp-2 pr-4">{{ item.title }}</h3>
                      <p class="ml-4">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
                    </div>
                    <p class="mt-1 text-sm text-[var(--text-secondary)]">{{ item.category }}</p>
                  </div>
                  <div class="flex flex-1 items-end justify-between text-sm">
                    <p class="text-[var(--text-secondary)]">数量 {{ item.quantity }}</p>
                  </div>
                </div>
              </li>
            </ul>

            <div class="border-t border-[var(--border-color)] pt-6 space-y-4">
              <div class="flex justify-between text-sm text-[var(--text-color)]">
                <p>商品小计</p>
                <p>¥{{ cartTotal.toFixed(2) }}</p>
              </div>
              <div class="flex justify-between text-sm text-[var(--text-color)]">
                <p>运费</p>
                <p>¥0.00</p>
              </div>
              <div class="flex justify-between text-base font-medium text-[var(--text-color)] pt-4 border-t border-[var(--border-color)]">
                <p>订单总计</p>
                <p>¥{{ cartTotal.toFixed(2) }}</p>
              </div>
            </div>

            <div class="mt-6">
              <BaseButton 
                block 
                size="lg" 
                :loading="isProcessing"
                :disabled="cartItems.length === 0 || !isFormValid"
                @click="handleCheckout"
              >
                {{ isProcessing ? '处理中...' : '确认支付' }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CreditCardIcon, QrCodeIcon, PlusIcon, CheckCircleIcon, TrashIcon } from '@heroicons/vue/24/outline'
import RegionSelect from '~/components/ui/RegionSelect.vue'
import { validatePhone } from '~/utils/validation'

definePageMeta({
  middleware: 'auth'
})

const { cartItems, cartTotal, clearCart } = useCart()
const { createOrder } = useOrders()
const router = useRouter()
const toast = useToast()

const isProcessing = ref(false)
const selectedPayment = ref('alipay')
const isNewAddressMode = ref(false)
const selectedAddressId = ref<string>('')
const savedAddresses = ref<any[]>([])

const loadServerAddresses = async () => {
  try {
    const res = await $fetch<{ code: number; message: string; data: any[] }>('/api/user/addresses')
    if (res.data && res.data.length > 0) {
      savedAddresses.value = res.data.map((a) => ({
        id: String(a._id),
        name: a.name,
        phone: a.phone,
        detail: `${a.region} ${a.detail}`,
        isDefault: a.isDefault
      }))

      let defaultAddr = savedAddresses.value.find(a => a.isDefault)
      if (!defaultAddr && savedAddresses.value.length > 0) {
        defaultAddr = savedAddresses.value[0]
        savedAddresses.value = savedAddresses.value.map((a, idx) => ({ ...a, isDefault: idx === 0 }))
      }
      if (defaultAddr) {
        selectedAddressId.value = String(defaultAddr.id)
      }
      isNewAddressMode.value = false
      return
    }
  } catch (e) {
    console.error('Failed to load addresses from server', e)
  }

  if (savedAddresses.value.length === 0) {
    isNewAddressMode.value = true
  }
}

onMounted(async () => {
  await loadServerAddresses()
})

const selectAddress = (address: any) => {
  selectedAddressId.value = String(address.id)
  isNewAddressMode.value = false
  // 前端仅标记当前选中项，默认状态由 Profile 中的地址管理控制
  savedAddresses.value = savedAddresses.value.map(a => ({ ...a, isDefault: String(a.id) === String(address.id) }))
}

const { confirm } = useConfirm()

const deleteAddress = async (e: Event, id: string) => {
  e.stopPropagation()
  
  const isConfirmed = await confirm({
    title: '删除地址',
    message: '确定要删除这个地址吗？',
    type: 'warning',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (isConfirmed) {
    await $fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
    savedAddresses.value = savedAddresses.value.filter(a => String(a.id) !== String(id))
    if (String(selectedAddressId.value) === String(id)) {
      if (savedAddresses.value.length > 0) {
        const defaultAddr = savedAddresses.value.find(a => a.isDefault) || savedAddresses.value[0]
        selectedAddressId.value = String(defaultAddr.id)
      } else {
        selectedAddressId.value = ''
        isNewAddressMode.value = true
      }
    }
    toast.success('地址已删除')
  }
}


const paymentMethods = [
  { id: 'alipay', name: '支付宝', icon: QrCodeIcon },
  { id: 'wechat', name: '微信支付', icon: QrCodeIcon },
  { id: 'credit_card', name: '信用卡', icon: CreditCardIcon },
]

const form = reactive({
  firstName: '',
  lastName: '',
  address: '',
  region: '',
  postalCode: '',
  phone: ''
})

const isRegionValid = computed(() => {
  const parts = form.region.split(' ').filter(Boolean)
  return parts.length >= 3
})

const isPhoneValid = computed(() => !validatePhone(form.phone))

const isFormValid = computed(() => {
  if (!isNewAddressMode.value && selectedAddressId.value) return true
  return Boolean(
    form.firstName &&
    form.lastName &&
    form.address &&
    isRegionValid.value &&
    isPhoneValid.value
  )
})

const handleCheckout = async () => {
  if (!isFormValid.value) {
    if (!isRegionValid.value) {
      toast.error('请选择完整的省、市、区')
    } else if (!isPhoneValid.value) {
      toast.error(validatePhone(form.phone) || '请输入有效的11位手机号码')
    }
    return
  }

  isProcessing.value = true
  
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  let addressData
  if (isNewAddressMode.value) {
    addressData = {
      name: `${form.firstName}${form.lastName}`,
      phone: form.phone,
      address: `${form.region} ${form.address}`
    }
    // 保存新地址到服务器并设为默认
    try {
      const res = await $fetch<{ code: number; message: string; data: any }>('/api/user/addresses', {
        method: 'POST',
        body: {
          name: addressData.name,
          phone: addressData.phone,
          region: form.region,
          detail: form.address,
          isDefault: true
        }
      })
      const created = res.data
      savedAddresses.value = savedAddresses.value.map(a => ({ ...a, isDefault: false }))
      const newAddr = {
        id: String(created._id),
        name: created.name,
        phone: created.phone,
        detail: `${created.region} ${created.detail}`,
        isDefault: created.isDefault
      }
      savedAddresses.value.unshift(newAddr)
      selectedAddressId.value = String(newAddr.id)
      isNewAddressMode.value = false
    } catch (e: any) {
      isProcessing.value = false
      toast.error(e.statusMessage || '保存地址失败')
      return
    }
  } else {
    const selected = savedAddresses.value.find(a => a.id === selectedAddressId.value)
    if (selected) {
      addressData = {
        name: selected.name,
        phone: selected.phone,
        address: selected.detail
      }
    }
  }

  if (addressData) {
    createOrder(
      cartItems.value,
      cartTotal.value,
      addressData
    )

    await clearCart()
    isProcessing.value = false
    
    toast.success('订单支付成功！')
    router.push('/orders')
  } else {
    isProcessing.value = false
    toast.error('请选择收货地址')
  }
}
</script>

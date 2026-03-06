<template>
  <BaseCard title="接收设置">
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const toast = useToast()

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
</script>

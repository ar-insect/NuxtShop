<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <h1 class="text-2xl font-bold text-[var(--text-color)]">
      {{ t('admin.system.setting.title') }}
    </h1>

    <BaseCard class="p-6 space-y-6">
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-[var(--text-color)]">
          {{ t('admin.system.setting.shippingTitle') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <AdminFormField
            v-model="shippingBaseFee"
            component="number"
            :label="t('admin.system.setting.shippingBaseFeeLabel')"
            :placeholder="t('admin.system.setting.shippingBaseFeePlaceholder')"
          />
          <AdminFormField
            v-model="shippingFreeThreshold"
            component="number"
            :label="t('admin.system.setting.shippingFreeThresholdLabel')"
            :hint="t('admin.system.setting.shippingFreeThresholdHint')"
            :placeholder="t('admin.system.setting.shippingFreeThresholdPlaceholder')"
          />
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-[var(--text-color)]">
          {{ t('admin.system.setting.paymentTitle') }}
        </h2>
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="payments.alipay" type="checkbox" class="rounded border-[var(--border-color)]">
            {{ t('admin.system.setting.paymentAlipay') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="payments.wechat" type="checkbox" class="rounded border-[var(--border-color)]">
            {{ t('admin.system.setting.paymentWechat') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input v-model="payments.creditCard" type="checkbox" class="rounded border-[var(--border-color)]">
            {{ t('admin.system.setting.paymentCard') }}
          </label>
        </div>
      </section>

      <div class="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
        <BaseButton variant="secondary" size="sm" :disabled="saving" @click="resetFromServer">
          {{ t('admin.system.setting.reset') }}
        </BaseButton>
        <BaseButton variant="primary" size="sm" :loading="saving" @click="handleSave">
          {{ t('admin.system.setting.save') }}
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { http } from '~/utils/http'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminSystemSettingPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const shippingBaseFee = ref<number | null>(null)
const shippingFreeThreshold = ref<number | null>(null)

const payments = reactive({
  alipay: true,
  wechat: true,
  creditCard: true
})

const saving = ref(false)

const { t } = useI18n()

const applySettings = (payload: any) => {
  const s = payload?.data || payload
  if (!s) return

  if (s.shipping) {
    shippingBaseFee.value = typeof s.shipping.baseFee === 'number' ? s.shipping.baseFee : 0
    shippingFreeThreshold.value =
      typeof s.shipping.freeThreshold === 'number' ? s.shipping.freeThreshold : null
  }

  if (s.payments) {
    payments.alipay = !!s.payments.alipay
    payments.wechat = !!s.payments.wechat
    payments.creditCard = !!s.payments.creditCard
  }
}

const { data } = await useAsyncData(
  'admin-system-settings',
  () => http.get<{ code: number; message: string; data: any }>('/admin/system/settings'),
  { server: false }
)

watch(
  () => data.value,
  (val) => {
    if (val?.data) {
      applySettings(val)
    }
  },
  { immediate: true }
)

const toast = useToast()

const resetFromServer = async () => {
  try {
    saving.value = true
    const res = await http.get<{ code: number; message: string; data: any }>('/admin/system/settings')
    ;(data.value as any) = res
    applySettings(res)
    toast.success(t('admin.system.setting.reloadedFromServer'))
  } finally {
    saving.value = false
  }
}

const handleSave = async () => {
  const payload: any = {
    shipping: {
      baseFee: shippingBaseFee.value ?? 0,
      freeThreshold: shippingFreeThreshold.value && shippingFreeThreshold.value > 0 ? shippingFreeThreshold.value : null
    },
    payments: {
      alipay: payments.alipay,
      wechat: payments.wechat,
      creditCard: payments.creditCard
    }
  }

  try {
    saving.value = true
    const res = await http.put<{ code: number; message: string; data: any }>(
      '/admin/system/settings',
      payload
    )
    ;(data.value as any) = res
    applySettings(res)
    toast.success(t('admin.system.setting.saveSuccess'))
  } finally {
    saving.value = false
  }
}
</script>

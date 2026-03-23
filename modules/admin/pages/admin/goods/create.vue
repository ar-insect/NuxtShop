<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.goods.form.createTitle') }}
      </h1>
      <BaseButton variant="ghost" @click="goBack">
        {{ t('admin.goods.form.backToList') }}
      </BaseButton>
    </div>
    <BaseCard class="p-6 space-y-6">
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.title"
          required
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldTitle')"
          :placeholder="t('admin.goods.form.fieldTitlePlaceholder')"
        />
        <AdminFormField
          v-model="form.category"
          required
          component="select"
          :options="categoryOptions"
          :label="t('admin.goods.form.fieldCategory')"
          :placeholder="t('admin.goods.form.fieldCategoryPlaceholder')"
        />
        <AdminFormField
          v-model.number="form.price"
          required
          type="number"
          :label="t('admin.goods.form.fieldPrice')"
          :placeholder="t('admin.goods.form.fieldPricePlaceholder')"
        />
        <AdminFormField
          v-model="form.image"
          required
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldImage')"
          :placeholder="t('admin.goods.form.fieldImagePlaceholder')"
          :rules="[{ type: 'url', message: t('admin.goods.form.imageUrlInvalid') }]"
        />
        <AdminFormField
          v-model="form.imagesText"
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldImages')"
          :placeholder="t('admin.goods.form.fieldImagesPlaceholder')"
        />
        <AdminFormField
          v-model="form.description"
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldDescription')"
          :placeholder="t('admin.goods.form.fieldDescriptionPlaceholder')"
        />
      </form>

      <div class="flex items-center justify-end gap-2 pt-2">
        <BaseButton variant="secondary" size="sm" @click="resetForm">
          {{ t('admin.goods.form.reset') }}
        </BaseButton>
        <BaseButton variant="primary" size="sm" :loading="submitting" @click="handleSubmit">
          {{ t('admin.goods.form.submitCreate') }}
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { http } from '~/utils/http'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import { useRouter } from '#imports'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminGoodsCreatePage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const router = useRouter()
const toast = useToast()
const { categoryLabels } = useCategoryMapper()
const { t } = useI18n()

const { data: categoryData } = await useAsyncData(
  'admin-product-categories-create',
  () => http.get<{ key: string; label: string }[]>('/products/categories'),
  {
    default: () => [] as { key: string; label: string }[]
  }
)

const categoryOptions = computed(() => {
  const raw = categoryData.value as any
  const list: { key: string; label: string }[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : []

  return list.map((c) => ({
    label: categoryLabels[c.key] || c.label || c.key,
    value: c.key
  }))
})

const submitting = ref(false)

const form = reactive({
  title: '',
  category: '',
  price: 0,
  image: '',
  imagesText: '',
  description: ''
})

const resetForm = () => {
  form.title = ''
  form.category = ''
  form.price = 0
  form.image = ''
  form.imagesText = ''
  form.description = ''
}

const goBack = () => {
  router.push('/admin/goods')
}

const handleSubmit = async () => {
  if (!form.title || !form.category || !form.image || form.price === null || form.price === undefined) {
    toast.error(t('admin.goods.form.errorRequired'))
    return
  }

  const priceNumber = Number(form.price)
  if (Number.isNaN(priceNumber) || priceNumber < 0) {
    toast.error(t('admin.goods.form.errorPriceInvalid'))
    return
  }

  const images = form.imagesText
    ? form.imagesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [form.image]

  try {
    submitting.value = true
    await http.post('/admin/products', {
      title: form.title,
      category: form.category,
      price: priceNumber,
      image: form.image,
      images,
      description: form.description
    })
    toast.success(t('admin.goods.form.createSuccess'))
    router.push('/admin/goods')
  } finally {
    submitting.value = false
  }
}
</script>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.goods.form.editTitle') }}
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
          component="number"
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
          required
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldDescription')"
          :placeholder="t('admin.goods.form.fieldDescriptionPlaceholder')"
        />

        <BaseRichTextEditor
          v-model="form.detailHtml"
          class="md:col-span-2"
          :label="t('admin.goods.form.fieldDetailHtml')"
          :placeholder="t('admin.goods.form.fieldDetailHtmlPlaceholder')"
          :hint="t('admin.goods.form.fieldDetailHtmlHint')"
        />

        <div class="md:col-span-2 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium" :style="{ color: 'var(--text-color)' }">
              {{ t('admin.goods.form.fieldSpecsTitle') }}
              <span class="ml-0.5 text-red-500">*</span>
            </span>
            <BaseButton type="button" size="xs" variant="ghost" @click="addSpecRow">
              {{ t('admin.goods.form.fieldSpecsAdd') }}
            </BaseButton>
          </div>
          <div v-if="form.specs.length" class="space-y-2">
            <div
              v-for="(spec, index) in form.specs"
              :key="index"
              class="grid grid-cols-1 sm:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] gap-3"
            >
              <BaseInput
                v-model="spec.label"
                :placeholder="t('admin.goods.form.fieldSpecsNamePlaceholder')"
              />
              <div class="flex gap-2">
                <BaseInput
                  v-model="spec.value"
                  :placeholder="t('admin.goods.form.fieldSpecsValuePlaceholder')"
                  class="flex-1"
                />
                <BaseButton
                  type="button"
                  size="xs"
                  variant="ghost"
                  class="shrink-0"
                  @click="removeSpecRow(index)"
                >
                  ×
                </BaseButton>
              </div>
            </div>
          </div>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
            {{ t('admin.goods.form.fieldSpecsHint') }}
          </p>
        </div>
      </form>

      <div class="flex items-center justify-end pt-2">
        <BaseButton variant="primary" size="sm" :loading="submitting" @click="handleSubmit">
          {{ t('admin.goods.form.submitEdit') }}
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { useCategoryMapper } from '~/modules/product/composables/useCategoryMapper'
import { http } from '~/utils/http'
import type { ApiResponse } from '~/types/common'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseRichTextEditor from '~/components/ui/BaseRichTextEditor.vue'
import { useRoute, useRouter } from '#imports'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminGoodsEditPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { categoryLabels } = useCategoryMapper()
const { t } = useI18n()

const idParam = route.params.id
const id = Number(idParam)

const { data: categoryData } = await useAsyncData(
  'admin-product-categories-edit',
  () => http.get<ApiResponse<{ key: string; label: string }[]>>('/products/categories'),
  {
    default: () => ({ code: 200, message: 'OK', data: [] as { key: string; label: string }[] })
  }
)

const categoryOptions = computed(() => {
  const list: { key: string; label: string }[] = categoryData.value?.data || []

  return list.map((c) => ({
    label: categoryLabels[c.key] || c.label || c.key,
    value: c.key
  }))
})

const submitting = ref(false)
const loading = ref(false)

const form = reactive({
  title: '',
  category: '',
  price: 0,
  image: '',
  imagesText: '',
  description: '',
  detailHtml: '',
  specs: [] as { label: string; value: string }[]
})

const loadProduct = async () => {
  if (!Number.isFinite(id)) return
  loading.value = true
  try {
    const product = await http.get<{
      id: number
      title: string
      price: number
      description: string
      detailHtml?: string
      category: string
      image: string
      images: string[]
      specs?: { label: string; value: string }[]
    }>(`/products/${id}`)

    form.title = product.title
    form.category = product.category
    form.price = product.price
    form.image = product.image
    form.description = product.description
    form.detailHtml = (product.detailHtml && product.detailHtml.trim())
      ? product.detailHtml
      : (product.description || '')
    form.imagesText = Array.isArray(product.images) ? product.images.join(',') : ''
    form.specs = Array.isArray(product.specs) ? [...product.specs] : []
  } finally {
    loading.value = false
  }
}

await loadProduct()

const goBack = () => {
  router.push('/admin/goods')
}

const addSpecRow = () => {
  form.specs.push({ label: '', value: '' })
}

const removeSpecRow = (index: number) => {
  form.specs.splice(index, 1)
}

const handleSubmit = async () => {
  if (submitting.value) return
  if (!form.title || !form.category || !form.image || form.price === null || form.price === undefined) {
    toast.error(t('admin.goods.form.errorRequired'))
    return
  }

  if (!form.description || !String(form.description).trim()) {
    toast.error(t('admin.goods.form.errorDescriptionRequired'))
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

  const specs = form.specs
    .map((item) => ({
      label: String(item.label || '').trim(),
      value: String(item.value || '').trim()
    }))
    .filter((item) => item.label || item.value)

  if (!specs.length) {
    toast.error(t('admin.goods.form.errorSpecsRequired'))
    return
  }

  try {
    submitting.value = true
    await http.put<ApiResponse<any>>(`/admin/products/${id}`, {
      title: form.title,
      category: form.category,
      price: priceNumber,
      image: form.image,
      images,
      description: form.description,
      detailHtml: form.detailHtml,
      specs
    })
    toast.success(t('admin.goods.form.updateSuccess'))
    router.push('/admin/goods')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-12">
    <div class="border-b pb-5" :style="{ borderColor: 'var(--border-color)' }">
      <h1 class="text-3xl font-bold leading-tight" :style="{ color: 'var(--text-color)' }">
        {{ t('demo.components.title') }}
      </h1>
      <p class="mt-2 text-lg" :style="{ color: 'var(--text-secondary)' }">
        {{ t('demo.components.description') }}
      </p>
    </div>
    
    <!-- Modal Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.modal.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          {{ t('demo.components.modal.badge') }}
        </span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          {{ t('demo.components.modal.desc') }}
        </p>
        <div class="flex items-center gap-4">
          <BaseButton 
            variant="primary"
            @click="showModal = true"
          >
            {{ t('demo.components.modal.open') }}
          </BaseButton>
        </div>
        
        <BaseModal
          v-model="showModal"
          :title="t('demo.components.modal.dialogTitle')"
          @confirm="handleModalConfirm"
          @cancel="handleModalCancel"
        >
          <div class="space-y-4">
            <p class="text-[var(--text-secondary)]">
              {{ t('demo.components.modal.content') }}
            </p>
            <div class="p-4 rounded-lg border bg-[var(--muted-bg)] border-[var(--border-color)]">
              <p class="text-sm text-[var(--text-color)]">
                {{ t('demo.components.modal.tip') }}
              </p>
            </div>
          </div>
        </BaseModal>
      </div>
    </section>

    <!-- Loading Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.loading.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          {{ t('demo.components.loading.badge') }}
        </span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          {{ t('demo.components.loading.desc') }}
        </p>
        
        <div class="relative h-64 rounded-lg border border-dashed flex items-center justify-center mb-6 overflow-hidden bg-[var(--muted-bg)] border-[var(--border-color)]">
          <div class="text-center p-6">
            <h3 class="text-lg font-medium mb-2 text-[var(--text-color)]">
              {{ t('demo.components.loading.boxTitle') }}
            </h3>
            <p class="max-w-sm mx-auto text-[var(--text-secondary)]">
              {{ t('demo.components.loading.boxDesc') }}
            </p>
          </div>
          
          <!-- Loading Component -->
          <BaseLoading :loading="loading" :text="t('demo.components.loading.loadingText')" />
        </div>

        <button 
          :disabled="loading"
          class="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-[var(--hover-bg)] bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-color)]"
          @click="toggleLoading"
        >
          {{ loading ? t('demo.components.loading.buttonLoading') : t('demo.components.loading.buttonToggle') }}
        </button>
      </div>
    </section>

    <!-- Toast Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.toast.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
          {{ t('demo.components.toast.badge') }}
        </span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          {{ t('demo.components.toast.desc') }}
        </p>
        
        <div class="flex flex-wrap gap-4">
          <BaseButton 
            variant="success"
            @click="toast.success(t('demo.components.toast.successMsg'))"
          >
            {{ t('demo.components.toast.successLabel') }}
          </BaseButton>
          
          <BaseButton 
            variant="danger"
            @click="toast.error(t('demo.components.toast.errorMsg'))"
          >
            {{ t('demo.components.toast.errorLabel') }}
          </BaseButton>
          
          <BaseButton 
            variant="secondary"
            @click="toast.info(t('demo.components.toast.infoMsg'))"
          >
            {{ t('demo.components.toast.infoLabel') }}
          </BaseButton>
          
          <BaseButton 
            variant="outline"
            @click="toast.warning(t('demo.components.toast.warningMsg'))"
          >
            {{ t('demo.components.toast.warningLabel') }}
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- Confirm Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.confirm.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          {{ t('demo.components.confirm.badge') }}
        </span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          {{ t('demo.components.confirm.desc') }}
        </p>
        
        <div class="flex flex-wrap gap-4">
          <BaseButton 
            variant="danger"
            @click="handleConfirmDelete"
          >
            {{ t('demo.components.confirm.deleteButton') }}
          </BaseButton>
          
          <BaseButton 
            variant="outline"
            @click="handleConfirmWarning"
          >
            {{ t('demo.components.confirm.warningButton') }}
          </BaseButton>
          
          <BaseButton 
            variant="secondary"
            @click="handleConfirmInfo"
          >
            {{ t('demo.components.confirm.infoButton') }}
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- BaseButton Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.button.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
          {{ t('demo.components.button.badge') }}
        </span>
      </div>
      <div class="p-6 space-y-8">
        <!-- Variants -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">
            {{ t('demo.components.button.variantsTitle') }}
          </h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton>{{ t('demo.components.button.primary') }}</BaseButton>
            <BaseButton variant="secondary">{{ t('demo.components.button.secondary') }}</BaseButton>
            <BaseButton variant="outline">{{ t('demo.components.button.outline') }}</BaseButton>
            <BaseButton variant="danger">{{ t('demo.components.button.danger') }}</BaseButton>
            <BaseButton variant="success">{{ t('demo.components.button.success') }}</BaseButton>
            <BaseButton variant="ghost">{{ t('demo.components.button.ghost') }}</BaseButton>
            <BaseButton variant="link">{{ t('demo.components.button.link') }}</BaseButton>
          </div>
        </div>

        <!-- Sizes -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">
            {{ t('demo.components.button.sizesTitle') }}
          </h3>
          <div class="flex flex-wrap items-center gap-4">
            <BaseButton size="xs">{{ t('demo.components.button.sizeXs') }}</BaseButton>
            <BaseButton size="sm">{{ t('demo.components.button.sizeSm') }}</BaseButton>
            <BaseButton size="md">{{ t('demo.components.button.sizeMd') }}</BaseButton>
            <BaseButton size="lg">{{ t('demo.components.button.sizeLg') }}</BaseButton>
            <BaseButton size="xl">{{ t('demo.components.button.sizeXl') }}</BaseButton>
          </div>
        </div>

        <!-- States -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">
            {{ t('demo.components.button.statesTitle') }}
          </h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton :loading="true">{{ t('demo.components.button.loading') }}</BaseButton>
            <BaseButton disabled>{{ t('demo.components.button.disabled') }}</BaseButton>
            <BaseButton disabled variant="secondary">
              {{ t('demo.components.button.disabledSecondary') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- BaseInput Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.input.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          {{ t('demo.components.input.badge') }}
        </span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput 
            v-model="inputValues.username" 
            :label="t('demo.components.input.usernameLabel')"
            :placeholder="t('demo.components.input.usernamePlaceholder')"
            :hint="t('demo.components.input.usernameHint')"
          />
          
          <BaseInput 
            v-model="inputValues.email" 
            :label="t('demo.components.input.emailLabel')"
            type="email" 
            placeholder="you@example.com"
          />

          <BaseInput 
            v-model="inputValues.password" 
            :label="t('demo.components.input.passwordLabel')"
            type="password" 
            :placeholder="t('demo.components.input.passwordPlaceholder')"
          />

          <BaseInput 
            v-model="inputValues.error" 
            :label="t('demo.components.input.errorLabel')"
            :placeholder="t('demo.components.input.errorPlaceholder')"
            :error="t('demo.components.input.errorMessage')"
          />

          <BaseInput 
            v-model="inputValues.search" 
            :label="t('demo.components.input.searchLabel')"
            :placeholder="t('demo.components.input.searchPlaceholder')"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :style="{ color: 'var(--text-secondary)' }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </template>
          </BaseInput>

          <BaseInput 
            v-model="inputValues.disabled" 
            :label="t('demo.components.input.disabledLabel')"
            :placeholder="t('demo.components.input.disabledPlaceholder')"
            disabled
          />
        </div>
      </div>
    </section>

    <!-- Select Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.select.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          {{ t('demo.components.select.badge') }}
        </span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseSelect 
            v-model="selectValues.single" 
            :label="t('demo.components.select.singleLabel')"
            :options="selectOptions"
            :placeholder="t('demo.components.select.singlePlaceholder')"
            clearable
          />
          
          <BaseSelect 
            v-model="selectValues.multiple" 
            :label="t('demo.components.select.multipleLabel')"
            :options="selectOptions"
            :placeholder="t('demo.components.select.multiplePlaceholder')"
            multiple
            clearable
          />

          <BaseSelect 
            v-model="selectValues.disabled" 
            :label="t('demo.components.select.disabledLabel')"
            :options="selectOptions"
            disabled
            :placeholder="t('demo.components.select.disabledPlaceholder')"
          />
          
          <div>
            <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">
              {{ t('demo.components.select.regionTitle') }}
            </h3>
            <RegionSelect v-model="regionDemo" />
            <p class="mt-2 text-xs text-[var(--text-secondary)]">
              {{ t('demo.components.select.regionCurrent', { value: regionDemo || t('demo.components.select.regionNone') }) }}
            </p>
          </div>
        </div>
        <div class="mt-4 text-sm text-[var(--text-secondary)]">
          <p>{{ t('demo.components.select.singleValue') }}: {{ selectValues.single }}</p>
          <p>{{ t('demo.components.select.multipleValue') }}: {{ selectValues.multiple }}</p>
        </div>
      </div>
    </section>

    <!-- Dropdown & Carousel Demo -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Dropdown -->
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-medium text-[var(--text-color)]">
            {{ t('demo.components.dropdown.title') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
            {{ t('demo.components.dropdown.badge') }}
          </span>
        </div>
        <div class="p-6 flex justify-center items-start h-48">
          <BaseDropdown :label="t('demo.components.dropdown.label')">
            <template #default="{ close }">
              <a href="#" class="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--hover-bg)]" @click.prevent="close">
                {{ t('demo.components.dropdown.view') }}
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--hover-bg)]" @click.prevent="close">
                {{ t('demo.components.dropdown.edit') }}
              </a>
              <div class="border-t border-[var(--border-color)] my-1"/>
              <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click.prevent="close">
                {{ t('demo.components.dropdown.delete') }}
              </a>
            </template>
          </BaseDropdown>
        </div>
      </div>

      <!-- Carousel -->
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-medium text-[var(--text-color)]">
            {{ t('demo.components.carousel.title') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">
            {{ t('demo.components.carousel.badge') }}
          </span>
        </div>
        <div class="p-6">
          <div class="h-48 rounded-lg overflow-hidden">
            <BaseCarousel class="h-48" :items="carouselItems" indicators controls autoplay>
              <template #default="{ item }">
                <div class="w-full h-full flex items-center justify-center text-white text-xl font-bold" :class="item.bg">
                  {{ item.title }}
                </div>
              </template>
            </BaseCarousel>
          </div>
        </div>
      </div>
    </section>

    <!-- BaseCard Demo -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-[var(--text-color)]">
          {{ t('demo.components.card.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          {{ t('demo.components.card.badge') }}
        </span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard :title="t('demo.components.card.simpleTitle')" :subtitle="t('demo.components.card.simpleSubtitle')">
          <p class="text-[var(--text-secondary)]">
            {{ t('demo.components.card.simpleContent') }}
          </p>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-[var(--text-color)]">
                {{ t('demo.components.card.customHeaderTitle') }}
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ t('demo.components.card.customHeaderBadge') }}
              </span>
            </div>
          </template>
            <p class="text-[var(--text-secondary)]">
              {{ t('demo.components.card.customHeaderContent') }}
            </p>
          <template #footer>
            <div class="flex justify-end">
              <BaseButton size="sm" variant="outline">
                {{ t('demo.components.card.customHeaderButton') }}
              </BaseButton>
            </div>
          </template>
        </BaseCard>
      </div>
    </section>

    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">
          {{ t('demo.components.pagination.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">
          {{ t('demo.components.pagination.badge') }}
        </span>
      </div>
      <div class="p-6 space-y-8">
        <div class="space-y-3">
          <div class="text-sm font-medium text-[var(--text-color)]">
            {{ t('demo.components.pagination.eventTitle') }}
          </div>
          <div class="flex justify-center">
            <BasePagination v-model="demoPage" :total-pages="demoTotalPages" />
          </div>
          <div class="text-sm text-[var(--text-secondary)]">
            {{ t('demo.components.pagination.currentPage', { page: demoPage, total: demoTotalPages }) }}
          </div>
          <div class="flex flex-wrap gap-3">
            <BaseButton size="sm" variant="outline" @click="demoTotalPages = 6">
              {{ t('demo.components.pagination.demoTotal6') }}
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoTotalPages = 24">
              {{ t('demo.components.pagination.demoTotal24') }}
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoPage = 1">
              {{ t('demo.components.pagination.goto1') }}
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoPage = Math.min(demoTotalPages, 10)">
              {{ t('demo.components.pagination.goto10') }}
            </BaseButton>
          </div>
        </div>

        <div class="pt-6 border-t border-[var(--border-color)] space-y-3">
          <div class="text-sm font-medium text-[var(--text-color)]">
            {{ t('demo.components.pagination.routeTitle') }}
          </div>
          <div class="flex justify-center">
            <BasePagination :model-value="routeDemoPage" :total-pages="routeDemoTotalPages" :get-to="routeDemoTo" />
          </div>
          <div class="text-sm text-[var(--text-secondary)]">
            {{ t('demo.components.pagination.currentQuery', { page: routeDemoPage }) }}
          </div>
        </div>
      </div>
    </section>

    <!-- Advanced Components Demo -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-[var(--text-color)]">
          {{ t('demo.components.advanced.title') }}
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
          {{ t('demo.components.advanced.badge') }}
        </span>
      </div>
      
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
        <h3 class="text-lg font-medium text-[var(--text-color)] mb-4">
          {{ t('demo.components.advanced.tsxTitle') }}
        </h3>
        <p class="text-[var(--text-secondary)] mb-4">
          {{ t('demo.components.advanced.tsxDesc') }}
        </p>
        <div class="flex gap-4">
          <TsxButton>{{ t('demo.components.advanced.tsxDefault') }}</TsxButton>
          <TsxButton variant="primary">{{ t('demo.components.advanced.tsxPrimary') }}</TsxButton>
        </div>
      </div>

      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
        <h3 class="text-lg font-medium text-[var(--text-color)] mb-4">
          {{ t('demo.components.advanced.styledTitle') }}
        </h3>
        <p class="text-[var(--text-secondary)] mb-4">
          {{ t('demo.components.advanced.styledDesc') }}
        </p>
        <div class="flex gap-4 items-center">
          <StyledButton>{{ t('demo.components.advanced.styledDefault') }}</StyledButton>
          <StyledButton :primary="true">
            {{ t('demo.components.advanced.styledPrimary') }}
          </StyledButton>
        </div>
      </div>
    </section>

    <div class="flex justify-center pt-8">
      <NuxtLink 
        to="/" 
        class="font-medium flex items-center gap-2 transition-colors hover:text-[var(--primary-color)] text-[var(--text-secondary)]"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        {{ t('demo.components.backHome') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseDropdown from '~/components/ui/BaseDropdown.vue'
import BaseCarousel from '~/components/ui/BaseCarousel.vue'
import RegionSelect from '~/components/ui/RegionSelect.vue'
import { useI18n } from '~/composables/useI18n'

const showModal = ref(false)
const toast = useToast()
const { t } = useI18n()

const handleModalConfirm = () => {
  showModal.value = false
  toast.success(t('demo.components.modal.confirmSuccess'))
}

const handleModalCancel = () => {
  showModal.value = false
  toast.info(t('demo.components.modal.cancelInfo'))
}

// Confirm Demo
const { confirm } = useConfirm()

const handleConfirmDelete = async () => {
  const isConfirmed = await confirm({
    title: t('demo.components.confirm.deleteTitle'),
    message: t('demo.components.confirm.deleteMessage'),
    type: 'danger',
    confirmText: t('demo.components.confirm.deleteConfirm'),
    cancelText: t('demo.components.confirm.deleteCancel')
  })
  
  if (isConfirmed) {
    toast.success(t('demo.components.confirm.deleteSuccess'))
  } else {
    toast.info(t('demo.components.confirm.deleteCancelInfo'))
  }
}

const handleConfirmWarning = async () => {
  const isConfirmed = await confirm({
    title: t('demo.components.confirm.warnTitle'),
    message: t('demo.components.confirm.warnMessage'),
    type: 'warning'
  })
  
  if (isConfirmed) {
    toast.success(t('demo.components.confirm.warnSuccess'))
  } else {
    toast.info(t('demo.components.confirm.warnCancelInfo'))
  }
}

const handleConfirmInfo = async () => {
  const isConfirmed = await confirm({
    title: t('demo.components.confirm.infoTitle'),
    message: t('demo.components.confirm.infoMessage'),
    type: 'info'
  })
  
  if (isConfirmed) {
    toast.success(t('demo.components.confirm.infoSuccess'))
  } else {
    toast.info(t('demo.components.confirm.infoCancelInfo'))
  }
}

// Loading
const loading = ref(false)
const toggleLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.success(t('demo.components.loading.doneToast'))
  }, 2000)
}

const inputValues = reactive({
  username: '',
  email: '',
  password: '',
  error: '',
  search: '',
  disabled: ''
})

const demoTotalPages = ref(24)
const demoPage = ref(3)

const route = useRoute()
const routeDemoTotalPages = ref(18)
const routeDemoPage = computed(() => {
  const v = route.query.demoPage
  const n = typeof v === 'string' ? Number(v) : 1
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
})

const routeDemoTo = (page: number) => {
  return { path: '/components-demo', query: { ...route.query, demoPage: page } }
}

const selectValues = reactive({
  single: '',
  multiple: [],
  disabled: ''
})

const regionDemo = ref('')

const selectOptions = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'svelte' }
]

const carouselItems = [
  { title: 'Slide 1', bg: 'bg-red-500' },
  { title: 'Slide 2', bg: 'bg-green-500' },
  { title: 'Slide 3', bg: 'bg-blue-500' }
]
</script>

<template>
  <BaseModal 
    v-model="isOpen" 
    :title="title" 
    :close-on-mask="closeOnMask"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div class="py-4">
      <div class="flex items-start gap-4">
        <div v-if="type === 'warning'" class="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div v-else-if="type === 'danger'" class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div v-else class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-500">{{ message }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="handleCancel">{{ cancelText }}</BaseButton>
      <BaseButton :variant="confirmVariant" @click="handleConfirm">{{ confirmText }}</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const { 
  isOpen, 
  title, 
  message, 
  type, 
  confirmText, 
  cancelText, 
  closeOnMask,
  handleConfirm, 
  handleCancel 
} = useConfirm()

const confirmVariant = computed(() => {
  switch (type.value) {
    case 'danger': return 'danger'
    case 'warning': return 'primary' // or warning if available
    default: return 'primary'
  }
})
</script>
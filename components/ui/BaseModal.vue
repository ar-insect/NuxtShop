<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-mask" @click="handleMaskClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <slot name="header">
              <h3>{{ displayTitle }}</h3>
            </slot>
            <button class="close-btn" @click="close">×</button>
          </div>

          <div class="modal-body">
            <slot>
              <p>{{ t('ui.modal.defaultContent') }}</p>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="btn btn-secondary" @click="close">
                {{ t('ui.modal.cancel') }}
              </button>
              <button class="btn btn-primary" @click="confirm">
                {{ t('ui.modal.confirm') }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  closeOnMask: {
    type: Boolean,
    default: true
  }
})

const { t } = useI18n()
const displayTitle = computed(() => props.title || t('ui.modal.title'))

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleMaskClick = () => {
  if (props.closeOnMask) {
    close()
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--modal-mask-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 500px;
  max-width: 90%;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.close-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

.modal-body {
  padding: 1rem;
  flex: 1;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  transition: filter 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(0.92);
}

.btn-secondary {
  background-color: var(--muted-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--hover-bg);
}

/* Transition styles */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(1.1);
}
</style>

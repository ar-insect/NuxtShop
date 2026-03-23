<template>
  <div v-if="loading" class="loading-overlay">
    <div class="spinner">
      <span />
      <span />
      <span />
    </div>
    <p v-if="displayText" class="loading-text">{{ displayText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()

const displayText = computed(() => props.text || t('ui.loading'))
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--loading-overlay-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: inherit;
}

.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.spinner span {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background-color: var(--primary-color);
  opacity: 0.25;
  transform: translateY(0);
  animation: admin-loading-bounce 0.9s infinite ease-in-out;
}

.spinner span:nth-child(2) {
  animation-delay: 0.15s;
}

.spinner span:nth-child(3) {
  animation-delay: 0.3s;
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@keyframes admin-loading-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>

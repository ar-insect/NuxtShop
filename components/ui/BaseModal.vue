<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-mask" @click.self="handleMaskClick">
        <div
          ref="modalRef"
          class="modal-container"
          :class="{
            'modal-fullscreen': isFullscreen,
            'modal-dragging': dragging
          }"
          :style="modalStyle"
          role="dialog"
          :aria-modal="true"
        >
          <div
            class="modal-header"
            :class="{
              'modal-header-draggable': draggable,
              'modal-header-dragging': dragging
            }"
            @mousedown="onHeaderMouseDown"
          >
            <div class="modal-title">
              <slot name="header">
                <h3>{{ displayTitle }}</h3>
              </slot>
            </div>
            <div class="modal-header-actions">
              <button
                v-if="enableFullscreen"
                type="button"
                class="icon-btn"
                :aria-label="isFullscreen ? t('ui.modal.restore') : t('ui.modal.maximize')"
                @click.stop="toggleFullscreen"
              >
                <ArrowsPointingOutIcon v-if="!isFullscreen" class="h-4 w-4" />
                <ArrowsPointingInIcon v-else class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="close-btn"
                :aria-label="t('ui.modal.cancel')"
                @click="close"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
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
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { CSSProperties } from 'vue'
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, XMarkIcon } from '@heroicons/vue/24/outline'
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
  },
  draggable: {
    type: Boolean,
    default: false
  },
  enableFullscreen: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const displayTitle = computed(() => props.title || t('ui.modal.title'))

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const modalRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const modalStart = ref({ x: 0, y: 0 })
const hasPosition = ref(false)
const position = ref({ x: 0, y: 0 })
const viewportSize = ref({ width: 0, height: 0 })
const modalSize = ref({ width: 0, height: 0 })
let previousActiveElement: Element | null = null

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

const modalStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (isFullscreen.value) {
    style.position = 'fixed'
    style.top = '0'
    style.left = '0'
    style.right = '0'
    style.bottom = '0'
    style.width = '100%'
    style.maxWidth = '100%'
    style.height = '100%'
    style.borderRadius = '0'
    return style
  }

  if (props.draggable && hasPosition.value) {
    // 使用 fixed，拖拽位置相对于视口，更直观且不受父级布局影响
    style.position = 'fixed'
    style.left = `${position.value.x}px`
    style.top = `${position.value.y}px`
    return style
  }

  return style
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const onHeaderMouseDown = (event: MouseEvent) => {
  if (!props.draggable || isFullscreen.value) return
  if (!modalRef.value) return

  // 只响应左键拖拽
  if (event.button !== 0) return

  // 点击在右侧按钮区域时不触发拖动
  const target = event.target as HTMLElement | null
  if (target && target.closest('.modal-header-actions')) return

  event.preventDefault()

  dragging.value = true

  const rect = modalRef.value.getBoundingClientRect()
  modalStart.value = { x: rect.left, y: rect.top }
  dragStart.value = { x: event.clientX, y: event.clientY }

  modalSize.value = { width: rect.width, height: rect.height }
  viewportSize.value = { width: window.innerWidth, height: window.innerHeight }

  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

const handleDrag = (event: MouseEvent) => {
  if (!dragging.value) return
  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  const margin = 16
  const maxX = Math.max(margin, viewportSize.value.width - margin - modalSize.value.width)
  const maxY = Math.max(margin, viewportSize.value.height - margin - modalSize.value.height)
  const nextX = modalStart.value.x + deltaX
  const nextY = modalStart.value.y + deltaY
  position.value = {
    x: Math.min(Math.max(nextX, margin), maxX),
    y: Math.min(Math.max(nextY, margin), maxY)
  }
  hasPosition.value = true
}

const stopDrag = () => {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
}

const focusFirstElement = () => {
  if (!modalRef.value) return
  const focusableSelectors = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
  ]
  const el = modalRef.value.querySelector<HTMLElement>(focusableSelectors.join(','))
  el?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    if (props.modelValue) {
      event.preventDefault()
      close()
    }
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previousActiveElement = document.activeElement
      await nextTick()
      focusFirstElement()

      // 每次打开时都以当前居中位置作为起点，保证默认垂直居中
      if (props.draggable && modalRef.value && !isFullscreen.value) {
        const rect = modalRef.value.getBoundingClientRect()
        position.value = { x: rect.left, y: rect.top }
        hasPosition.value = true
      }
    } else if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus()
      previousActiveElement = null
      // 下次打开重新居中
      hasPosition.value = false
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    previousActiveElement = document.activeElement
    focusFirstElement()
  }

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (previousActiveElement instanceof HTMLElement) {
    previousActiveElement.focus()
  }
  stopDrag()
  window.removeEventListener('keydown', handleKeydown)
})
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
  transform-origin: center center;
  transition: transform 0.25s ease, width 0.25s ease, height 0.25s ease, top 0.25s ease, left 0.25s ease;
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

.modal-title {
  display: flex;
  align-items: center;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

.icon-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.icon-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

.modal-fullscreen .modal-body {
  flex: 1;
  overflow: auto;
}

.modal-fullscreen {
  transform: scale(1.02);
}

.modal-header-draggable {
  cursor: move;
}

.modal-header-dragging {
  cursor: grabbing;
  user-select: none;
}

.modal-dragging {
  transition: none !important;
}

.modal-fullscreen .modal-header-draggable,
.modal-fullscreen .modal-header-dragging {
  cursor: default;
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
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease, filter 0.25s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform-origin: center center;
}

/* 打开：从略小放大到正常 */
.modal-enter-from .modal-container {
  transform: scale(0.95);
  filter: blur(2px);
}

/* 关闭：轻微“爆炸”放大后消失 */
.modal-leave-to .modal-container {
  transform: scale(1.05);
  filter: blur(3px);
}
</style>

<template>
  <span ref="triggerRef" class="inline-block" @mouseenter="show" @mouseleave="hide">
    <slot />
  </span>
  <Teleport to="body">
    <span
      v-if="visible && text"
      class="pointer-events-none fixed z-[9999] px-2 py-1 rounded bg-black/80 text-white text-[11px] leading-tight whitespace-nowrap"
      :style="style"
    >
      {{ text }}
    </span>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    placement?: 'top' | 'bottom'
    align?: 'center' | 'left' | 'right'
  }>(),
  {
    placement: 'top',
    align: 'center'
  }
)

const triggerRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const coords = ref({ top: 0, left: 0 })

const style = computed(() => ({
  top: `${coords.value.top}px`,
  left: `${coords.value.left}px`,
  transform:
    props.align === 'left'
      ? 'translateY(-50%)'
      : props.align === 'right'
        ? 'translateY(-50%)'
        : 'translate(-50%, -50%)'
}))

const show = () => {
  if (!props.text) return
  const el = triggerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  const centerX = rect.left + rect.width / 2 + scrollX
  const left =
    props.align === 'left'
      ? rect.left + scrollX
      : props.align === 'right'
        ? rect.right + scrollX
        : centerX

  const top =
    props.placement === 'bottom'
      ? rect.bottom + 8 + scrollY
      : rect.top - 8 + scrollY

  coords.value = { top, left }
  visible.value = true
}

const hide = () => {
  visible.value = false
}
</script>

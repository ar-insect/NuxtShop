<template>
  <div ref="containerRef" class="slider-captcha select-none">
    <div class="bg-gray-100 border border-gray-200 relative h-12 rounded-lg overflow-hidden flex items-center shadow-inner">
      <!-- Background Text -->
      <div 
        class="w-full text-center text-sm text-gray-400 transition-opacity duration-300 select-none"
        :class="{ 'opacity-0': isMoving || verified }"
      >
        {{ text }}
      </div>

      <!-- Success Background -->
      <div 
        class="absolute left-0 top-0 h-full bg-green-500 transition-all duration-0"
        :class="{ 'duration-300': !isMoving }"
        :style="{ width: `${sliderWidth}px` }"
      >
        <div v-if="verified" class="w-full h-full flex items-center justify-center text-white text-sm font-medium">
          验证通过
        </div>
      </div>

      <!-- Slider Handle -->
      <div
        class="absolute top-0 h-full w-12 bg-white border border-gray-300 shadow-sm rounded-md cursor-pointer flex items-center justify-center transition-all duration-0 hover:bg-gray-50 active:bg-gray-100"
        :class="{ 'duration-300': !isMoving }"
        :style="{ left: `${sliderLeft}px` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <div v-if="verified" class="text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <div v-else class="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  tolerance?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: '向右滑动验证',
  tolerance: 5 // Allowable pixel difference to consider as full slide
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'fail'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const sliderLeft = ref(0)
const sliderWidth = ref(0)
const isMoving = ref(false)
const verified = ref(false)
const startX = ref(0)

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (verified.value) return
  isMoving.value = true
  startX.value = 'touches' in e ? e.touches[0].clientX : e.clientX
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isMoving.value) return
  const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const containerWidth = containerRef.value?.clientWidth || 0
  const handleWidth = 48 // w-12 is 3rem = 48px
  const maxMove = containerWidth - handleWidth

  let moveX = currentX - startX.value
  
  if (moveX < 0) moveX = 0
  if (moveX > maxMove) moveX = maxMove

  sliderLeft.value = moveX
  sliderWidth.value = moveX + handleWidth // Fill background up to handle
}

const stopDrag = () => {
  if (!isMoving.value) return
  isMoving.value = false
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)

  const containerWidth = containerRef.value?.clientWidth || 0
  const handleWidth = 48
  const maxMove = containerWidth - handleWidth

  if (sliderLeft.value >= maxMove - props.tolerance) {
    verified.value = true
    sliderLeft.value = maxMove
    sliderWidth.value = containerWidth
    emit('success')
  } else {
    // 重置
    verified.value = false
    sliderLeft.value = 0
    sliderWidth.value = 0
    emit('fail')
  }
}

// 暴露给父组件的重置方法
const reset = () => {
  verified.value = false
  isMoving.value = false
  sliderLeft.value = 0
  sliderWidth.value = 0
}

defineExpose({ reset })
</script>

<style scoped>
.slider-captcha {
  width: 100%;
}
</style>

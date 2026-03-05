<template>
  <div class="puzzle-captcha relative w-full select-none" ref="containerRef">
    <div class="relative w-full h-[160px] bg-gray-100 rounded-lg overflow-hidden mb-4">
      <!-- Background Image -->
      <img
        ref="bgImageRef"
        :src="imageUrl"
        class="w-full h-full object-cover block"
        alt="Captcha Background"
        @load="initPuzzle"
      />
      
      <!-- Puzzle Piece (Overlay) -->
      <canvas
        ref="puzzleCanvasRef"
        class="absolute top-0 left-0 z-10"
        :style="{ left: `${sliderValue}px` }"
        :width="pieceWidth"
        :height="containerHeight"
      ></canvas>

      <!-- Target Hole (Visual indicator) -->
      <div 
        class="absolute bg-black/50 z-0 shadow-[0_0_10px_rgba(0,0,0,0.5)_inset]"
        :style="{ 
          left: `${targetX}px`, 
          top: `${targetY}px`,
          width: `${pieceWidth}px`, 
          height: `${pieceWidth}px`,
          clipPath: pathPath 
        }"
      ></div>

      <!-- Loading/Success/Fail Overlay -->
      <div v-if="status !== 'idle'" class="absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300" :class="statusClass">
        <div v-if="status === 'loading'" class="text-white">加载中...</div>
        <div v-if="status === 'success'" class="text-green-500 font-bold flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          验证通过
        </div>
        <div v-if="status === 'fail'" class="text-red-500 font-bold flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          验证失败
        </div>
      </div>
    </div>

    <!-- Slider Track -->
    <div class="relative h-10 bg-gray-100 rounded-full shadow-inner flex items-center">
      <div class="absolute left-0 top-0 h-full bg-blue-100/50 rounded-full border border-blue-200" :style="{ width: `${sliderValue + 20}px` }"></div>
      <div class="w-full text-center text-xs text-gray-400 select-none pointer-events-none">向右拖动滑块填充拼图</div>
      
      <!-- Slider Handle -->
      <div
        class="absolute top-0 h-10 w-10 bg-white rounded-full shadow-md border border-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-gray-50 transition-colors z-30"
        :style="{ left: `${sliderValue}px` }"
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
      >
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

const props = defineProps<{
  onSuccess?: () => void
  onFail?: () => void
}>()

const emit = defineEmits(['success', 'fail'])

// Config
const pieceWidth = 45 // Size of the puzzle piece
const tabHeight = 10  // Size of the puzzle tabs
const containerHeight = 160 // Height of the image container
const tolerance = 5   // Verification tolerance in pixels

// State
const sliderValue = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const status = ref<'idle' | 'loading' | 'success' | 'fail'>('idle')
const imageUrl = ref(`https://picsum.photos/300/160?random=${Math.random()}`)
const targetX = ref(0)
const targetY = ref(0)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const bgImageRef = ref<HTMLImageElement | null>(null)
const puzzleCanvasRef = ref<HTMLCanvasElement | null>(null)

// Computed
const statusClass = computed(() => {
  switch (status.value) {
    case 'success': return 'bg-white/90 opacity-100'
    case 'fail': return 'bg-white/90 opacity-100'
    case 'loading': return 'bg-black/50 opacity-100'
    default: return 'opacity-0 pointer-events-none'
  }
})

// Generate SVG Path for Clip-path (CSS) and Canvas drawing
const pathPath = computed(() => {
  // A simple puzzle piece shape using polygon/path syntax for clip-path is tricky 
  // without consistent units. CSS clip-path supports path() function in modern browsers.
  // We'll use a simplified square with a bump for the visual "hole" indicator.
  // Ideally, we match the canvas drawing logic.
  // For simplicity in this CSS representation, we'll just use a rounded square for the hole background
  // The actual shape detail comes from the canvas piece.
  return 'inset(0% 0% 0% 0% round 4px)' 
})

// Initialize Puzzle
const initPuzzle = () => {
  if (!bgImageRef.value || !puzzleCanvasRef.value || !containerRef.value) return

  const containerWidth = containerRef.value.clientWidth
  const maxLeft = containerWidth - pieceWidth - 10
  const minLeft = containerWidth / 2 // Target always on the right half

  // Randomize target position
  targetX.value = Math.floor(Math.random() * (maxLeft - minLeft) + minLeft)
  targetY.value = Math.floor(Math.random() * (containerHeight - pieceWidth - 10) + 5)

  drawPuzzlePiece()
}

// Draw the puzzle piece on canvas
const drawPuzzlePiece = () => {
  const canvas = puzzleCanvasRef.value
  const ctx = canvas?.getContext('2d')
  const img = bgImageRef.value
  
  if (!canvas || !ctx || !img) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Set canvas size to match piece width but full height (to handle y-offset internally)
  // Actually, we'll make canvas size = pieceWidth x pieceWidth and move it via CSS top
  canvas.width = pieceWidth
  canvas.height = pieceWidth
  canvas.style.top = `${targetY.value}px`

  // Define puzzle shape path
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(pieceWidth, 0)
  ctx.lineTo(pieceWidth, pieceWidth)
  ctx.lineTo(0, pieceWidth)
  ctx.closePath()
  
  // You can add tabs/holes logic here for a real puzzle shape. 
  // For this "Puzzle Captcha", a square cutout is often standard or a simple jigsaw shape.
  // Let's stick to a square for robustness first, then add shape complexity if needed.
  // To make it look like a puzzle piece, we can add a simple arc.
  // (Simplified for robustness)

  ctx.clip()
  
  // Draw the image segment corresponding to targetX, targetY
  // source x,y = targetX, targetY
  // source w,h = pieceWidth, pieceWidth
  // dest x,y = 0, 0
  // dest w,h = pieceWidth, pieceWidth
  
  // Note: The image might be scaled by CSS object-cover. 
  // We need to account for natural vs displayed size if we were doing precise pixel manipulation.
  // However, since we draw from the *displayed* image (if we could), but canvas draws from *source* image.
  // We need to calculate the ratio.
  
  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight
  const displayWidth = img.clientWidth
  const displayHeight = img.clientHeight
  
  const scaleX = naturalWidth / displayWidth
  const scaleY = naturalHeight / displayHeight
  
  ctx.drawImage(
    img,
    targetX.value * scaleX,
    targetY.value * scaleY,
    pieceWidth * scaleX,
    pieceWidth * scaleY,
    0,
    0,
    pieceWidth,
    pieceWidth
  )
  
  // Add an inner stroke/glow to make it pop
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // Restore for next draw if needed
}

// Drag Handlers
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (status.value === 'success') return
  e.preventDefault()
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  startX.value = clientX - sliderValue.value
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const containerWidth = containerRef.value?.clientWidth || 0
  const maxDrag = containerWidth - 40 // slider handle width
  
  let newVal = clientX - startX.value
  if (newVal < 0) newVal = 0
  if (newVal > maxDrag) newVal = maxDrag
  
  sliderValue.value = newVal
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
  
  verify()
}

const verify = () => {
  // Check if sliderValue (left position) is close to targetX
  // Note: sliderValue is the handle position. The puzzle piece moves with it.
  // The puzzle piece left = sliderValue.
  // The target hole left = targetX.
  
  const diff = Math.abs(sliderValue.value - targetX.value)
  
  if (diff <= tolerance) {
    status.value = 'success'
    emit('success')
    props.onSuccess?.()
  } else {
    status.value = 'fail'
    emit('fail')
    props.onFail?.()
    
    // Reset after delay
    setTimeout(() => {
      status.value = 'idle'
      sliderValue.value = 0
    }, 1000)
  }
}

// Reset method exposed to parent
const reset = () => {
  status.value = 'idle'
  sliderValue.value = 0
  imageUrl.value = `https://picsum.photos/300/160?random=${Math.random()}`
  // Re-init happens on image load
}

defineExpose({ reset })

</script>

<style scoped>
/* Optional styling refinements */
</style>

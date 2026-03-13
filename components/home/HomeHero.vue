<template>
  <section class="relative overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors duration-500" :style="{ borderRadius: 'var(--border-radius)' }">
    <!-- Dynamic Background Gradient -->
    <div 
      class="absolute inset-0 opacity-40 transition-all duration-1000 ease-in-out" 
      :style="{ background: currentSlide.gradient }"
    />
    
    <div class="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
      <div class="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-7 flex flex-col justify-center min-h-[320px]">
          <transition 
            mode="out-in" 
            enter-active-class="transition ease-out duration-300" 
            enter-from-class="opacity-0 translate-y-4" 
            enter-to-class="opacity-100 translate-y-0" 
            leave-active-class="transition ease-in duration-200" 
            leave-from-class="opacity-100 translate-y-0" 
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div :key="currentIndex" class="space-y-5">
              <div 
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[var(--text-color)] ring-1 ring-[var(--border-color)] backdrop-blur w-fit" 
                :style="{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--card-bg), transparent 20%)' }"
              >
                <SvgIcon :name="currentSlide.icon" class="h-4 w-4" :style="{ color: 'var(--primary-color)' }" />
                {{ currentSlide.tag }}
              </div>
              
              <h1 class="text-3xl font-extrabold tracking-tight text-[var(--text-color)] sm:text-5xl leading-tight">
                {{ currentSlide.title }}
              </h1>
              
              <p class="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
                {{ currentSlide.description }}
              </p>
            </div>
          </transition>

          <!-- Search Bar (Static) -->
          <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center z-10">
            <div class="w-full sm:flex-1">
              <BaseInput v-model="searchQuery" placeholder="搜索商品，例如：背包 / 戒指 / 夹克" @keyup.enter="handleSearch" />
            </div>
            <div class="flex gap-3 items-center">
              <StyledTsxButton label="去逛逛" variant="primary" @click="goToProducts()" />
              <BaseButton size="md" variant="outline" @click="handleSearch">搜索</BaseButton>
            </div>
          </div>

          <p class="mt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
            小提示：先按分类快速浏览，再收藏或加入购物车，最后在购物车统一结算。
          </p>

          <!-- Quick Links (Static) -->
          <div class="mt-8 flex flex-wrap gap-2 z-10">
            <button
              v-for="c in categoryCards"
              :key="c.key"
              class="inline-flex items-center gap-2 border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--bg-color)] transition-colors"
              :style="{ borderRadius: 'var(--border-radius)' }"
              @click="goToProducts({ category: c.key })"
            >
              <SvgIcon :name="c.icon" class="h-4 w-4" :style="{ color: 'var(--primary-color)' }" />
              {{ c.label }}
            </button>
          </div>
          
          <!-- Slide Indicators -->
          <div class="absolute bottom-4 left-6 sm:left-10 flex gap-2">
            <button 
              v-for="(_, index) in slides" 
              :key="index"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="index === currentIndex ? 'w-6 bg-[var(--primary-color)]' : 'w-1.5 bg-[var(--text-secondary)]/30 hover:bg-[var(--text-secondary)]'"
              :aria-label="`切换到第 ${index + 1} 张幻灯片`"
              @click="setSlide(index)"
            />
          </div>
        </div>

        <div class="lg:col-span-5 relative hidden lg:block h-full min-h-[400px]">
             <transition 
                mode="out-in" 
                enter-active-class="transition ease-out duration-500" 
                enter-from-class="opacity-0 scale-95" 
                enter-to-class="opacity-100 scale-100" 
                leave-active-class="transition ease-in duration-300" 
                leave-from-class="opacity-100 scale-100" 
                leave-to-class="opacity-0 scale-95"
              >
                <div :key="currentIndex" class="absolute inset-0 flex items-center justify-center">
                    <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group transform transition-transform hover:scale-[1.02] duration-500">
                        <img 
                          :src="currentSlide.image" 
                          :alt="currentSlide.title"
                          class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                          @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/1000x800/f3f4f6/9ca3af?text=No+Image'"
                        >
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <span class="text-white font-medium">点击查看详情</span>
                        </div>
                    </div>
                    
                    <!-- Floating Cards -->
                    <div class="absolute -bottom-6 -left-6 bg-[var(--card-bg)] p-4 rounded-xl shadow-lg border border-[var(--border-color)] max-w-[200px] transform transition-transform duration-500 hover:-translate-y-2 animate-float-slow hidden xl:block">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-teal-100 rounded-lg text-teal-600">
                                <SvgIcon name="truck" class="h-5 w-5" />
                            </div>
                            <div>
                                <p class="text-xs text-[var(--text-secondary)]">极速配送</p>
                                <p class="text-sm font-bold text-[var(--text-color)]">最快次日达</p>
                            </div>
                        </div>
                    </div>

                    <div class="absolute -top-6 -right-6 bg-[var(--card-bg)] p-4 rounded-xl shadow-lg border border-[var(--border-color)] max-w-[200px] transform transition-transform duration-500 hover:-translate-y-2 animate-float-delayed hidden xl:block">
                         <div class="flex items-center gap-3">
                            <div class="p-2 bg-rose-100 rounded-lg text-rose-600">
                                <SvgIcon name="tag" class="h-5 w-5" />
                            </div>
                            <div>
                                <p class="text-xs text-[var(--text-secondary)]">限时优惠</p>
                                <p class="text-sm font-bold text-[var(--text-color)]">满200减30</p>
                            </div>
                        </div>
                    </div>
                </div>
             </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import StyledTsxButton from '~/components/ui/StyledTsxButton'
import SvgIcon from '~/components/ui/SvgIcon.vue'

const _props = defineProps<{
  cartCount: number
  wishlistCount: number
  categoryCards: any[]
}>()

const emit = defineEmits(['search', 'navigate'])

const searchQuery = ref('')
const currentIndex = ref(0)
const timer = ref<any>(null)

const slides = [
  {
    tag: '今日上新 / 热门推荐',
    title: '发现你喜欢的好物',
    description: '这里是一个 Nuxt 3 电商风格首页示例：商品推荐、分类入口、加入购物车与收藏。',
    icon: 'sparkles',
    gradient: 'radial-gradient(1200px circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, rgba(255,255,255,0) 45%), radial-gradient(900px circle at 90% 10%, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 40%)',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    tag: '限时特惠 / 低至5折',
    title: '夏季清仓大促销',
    description: '精选夏季服饰、户外装备限时特惠。立即抢购，手慢无！',
    icon: 'fire',
    gradient: 'radial-gradient(1200px circle at 20% 80%, rgba(249, 115, 22, 0.15) 0%, rgba(255,255,255,0) 45%), radial-gradient(900px circle at 80% 20%, rgba(239, 68, 68, 0.15) 0%, rgba(255,255,255,0) 40%)',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    tag: '新品首发 / 科技潮流',
    title: '探索前沿数码科技',
    description: '最新发布的智能设备、电子配件，带你体验科技的魅力。',
    icon: 'star',
    gradient: 'radial-gradient(1200px circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(255,255,255,0) 50%), radial-gradient(900px circle at 10% 10%, rgba(59, 130, 246, 0.15) 0%, rgba(255,255,255,0) 40%)',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=80'
  }
]

const currentSlide = computed(() => slides[currentIndex.value])

const startTimer = () => {
  stopTimer()
  timer.value = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.length
  }, 5000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const setSlide = (index: number) => {
  currentIndex.value = index
  startTimer() // Reset timer on manual interaction
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const goToProducts = (query?: any) => {
  emit('navigate', query)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float-slow {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 7s ease-in-out infinite 1s;
}
</style>

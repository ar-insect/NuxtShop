<template>
  <div>
    <h2 class="text-2xl font-bold text-[var(--text-color)] mb-8">{{ t('reviews.title') }}</h2>

    <div class="grid md:grid-cols-12 gap-8">
      <!-- Review Summary & Form -->
      <div class="md:col-span-4 lg:col-span-4 space-y-8">
        <!-- Summary -->
        <div class="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-5xl font-bold text-[var(--text-color)]">{{ averageRating.toFixed(1) }}</div>
            <div>
              <div class="flex text-yellow-400 mb-1">
                <StarIcon v-for="i in 5" :key="i" :class="i <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'" class="w-5 h-5" />
              </div>
              <div class="text-sm text-[var(--text-secondary)]">
                {{ t('reviews.count', { count: reviews.length }) }}
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div v-for="i in 5" :key="i" class="flex items-center gap-2 text-sm">
              <span class="w-3 text-[var(--text-secondary)]">{{ 6 - i }}</span>
              <StarIcon class="w-4 h-4 text-gray-400" />
              <div class="flex-1 h-2 bg-[var(--bg-color)] rounded-full overflow-hidden">
                <div class="h-full bg-yellow-400" :style="{ width: `${getPercentage(6 - i)}%` }"/>
              </div>
              <span class="w-8 text-right text-[var(--text-secondary)]">{{ getCount(6 - i) }}</span>
            </div>
          </div>
        </div>

        <!-- Add Review Form -->
        <div v-if="isAuthenticated" class="border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl p-6">
          <h3 class="text-lg font-bold mb-4 text-[var(--text-color)]">{{ t('reviews.writeTitle') }}</h3>
          <form class="space-y-4" @submit.prevent="submitReview">
            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                {{ t('reviews.ratingLabel') }}
              </label>
              <div class="flex gap-1">
                <button 
                  v-for="i in 5" 
                  :key="i" 
                  type="button"
                  class="focus:outline-none transition-transform hover:scale-110"
                  @click="form.rating = i"
                  @mouseenter="hoverRating = i"
                  @mouseleave="hoverRating = 0"
                >
                  <StarIcon 
                    class="w-8 h-8 transition-colors" 
                    :class="(hoverRating || form.rating) >= i ? 'text-yellow-400 fill-current' : 'text-gray-300'" 
                  />
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                {{ t('reviews.contentLabel') }}
              </label>
              <textarea 
                v-model="form.content" 
                rows="4" 
                class="w-full rounded-md border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border placeholder-[var(--text-secondary)]"
                :placeholder="t('reviews.contentPlaceholder')"
                required
              />
            </div>

            <button 
              type="submit" 
              :disabled="submitting || form.rating === 0"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? t('reviews.submitting') : t('reviews.submit') }}
            </button>
          </form>
        </div>
        <div v-else class="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl text-center">
          <p class="text-[var(--text-secondary)] mb-4">{{ t('reviews.loginHint') }}</p>
          <NuxtLink to="/login" class="inline-block text-indigo-600 font-medium hover:underline">
            {{ t('reviews.goLogin') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Review List -->
      <div class="md:col-span-8 lg:col-span-8">
        <h3 class="text-lg font-bold mb-6 text-[var(--text-color)]">{{ t('reviews.latestTitle') }}</h3>
        
        <div v-if="loading" class="space-y-6">
          <div v-for="i in 3" :key="i" class="animate-pulse flex gap-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"/>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/4"/>
              <div class="h-4 bg-gray-200 rounded w-full"/>
              <div class="h-4 bg-gray-200 rounded w-2/3"/>
            </div>
          </div>
        </div>

        <div v-else-if="reviews.length > 0" class="space-y-8">
          <div v-for="review in visibleReviews" :key="review.id" class="flex gap-4 border-b border-[var(--border-color)] pb-8 last:border-0">
            <div class="flex-shrink-0">
              <img :src="review.userAvatar || 'https://www.gravatar.com/avatar?d=mp'" alt="" class="w-12 h-12 rounded-full object-cover border border-[var(--border-color)]">
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-[var(--text-color)]">{{ review.username }}</h4>
                <span class="text-sm text-[var(--text-secondary)]">{{ formatDate(review.createdAt) }}</span>
              </div>
              <div class="flex text-yellow-400 mb-2">
                <StarIcon v-for="i in 5" :key="i" :class="i <= review.rating ? 'fill-current' : 'text-gray-300'" class="w-4 h-4" />
              </div>
              <p class="text-[var(--text-color)] leading-relaxed">{{ review.content }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="reviews.length > 3"
          class="mt-6 flex justify-center"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border border-[var(--border-color)] rounded-full text-[var(--text-color)] hover:bg-[var(--bg-color)] transition-colors"
            @click="showAll = !showAll"
          >
            {{ showAll ? t('reviews.collapse') : t('reviews.expand', { count: reviews.length }) }}
          </button>
        </div>

        <div v-else class="text-center py-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
          <ChatBubbleLeftRightIcon class="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
          <p class="text-[var(--text-secondary)]">{{ t('reviews.empty') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import { http } from '~/utils/http'

const props = defineProps<{
  productId: number
}>()

const { isAuthenticated } = useAuth()
const toast = useToast()
const { t } = useI18n()

interface Review {
  id: string
  userId: string
  username: string
  userAvatar: string
  rating: number
  content: string
  createdAt: string
}

const reviews = ref<Review[]>([])
const loading = ref(true)
const submitting = ref(false)
const hoverRating = ref(0)
const showAll = ref(false)

const form = reactive({
  rating: 0,
  content: ''
})

// Fetch reviews
const fetchReviews = async () => {
  loading.value = true
  try {
    const res = await http.get<{ success: boolean; data: Review[] }>(`/reviews/${props.productId}`)
    if (res?.success) {
      reviews.value = res.data || []
    } else {
      reviews.value = []
    }
  } catch (error) {
    console.error('Failed to fetch reviews', error)
    reviews.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReviews()
})

// Submit review
const submitReview = async () => {
  if (form.rating === 0) {
    toast.error(t('reviews.ratingRequired'))
    return
  }
  
  submitting.value = true
  try {
    await http.post('/reviews/add', {
      productId: props.productId,
      rating: form.rating,
      content: form.content
    })

    toast.success(t('toast.reviewSubmitted'))
    form.rating = 0
    form.content = ''
    fetchReviews() // Refresh list
  } catch (e: any) {
    toast.error(e.message || t('reviews.submitFailed'))
  } finally {
    submitting.value = false
  }
}

// Helpers
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, curr) => acc + curr.rating, 0)
  return sum / reviews.value.length
})

const getCount = (star: number) => {
  return reviews.value.filter(r => r.rating === star).length
}

const getPercentage = (star: number) => {
  if (reviews.value.length === 0) return 0
  return (getCount(star) / reviews.value.length) * 100
}

const visibleReviews = computed(() => {
  if (showAll.value) return reviews.value
  return reviews.value.slice(0, 3)
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

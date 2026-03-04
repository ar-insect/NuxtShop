<template>
  <div class="utils-demo space-y-6">
    <BaseCard title="工具类演示">
      <div>常见工具函数的示例演示。</div>
    </BaseCard>
    
    <BaseCard title="日期工具 (utils/date.ts)">
      <div class="demo-item">
        <p>当前时间 (formatDateTime): {{ formatDateTime(now) }}</p>
        <p>当前日期 (formatDate): {{ formatDate(now) }}</p>
        <p>相对时间 (timeAgo - 5分钟前): {{ timeAgo(fiveMinutesAgo) }}</p>
      </div>
    </BaseCard>

    <BaseCard title="验证工具 (utils/validator.ts)">
      <div class="demo-item">
        <p>验证邮箱 (test@example.com): {{ isEmail('test@example.com') }}</p>
        <p>验证手机 (13800138000): {{ isMobile('13800138000') }}</p>
        <p>验证空值 (null): {{ isEmpty(null) }}</p>
      </div>
    </BaseCard>

    <BaseCard title="格式化工具 (utils/format.ts)">
      <div class="demo-item">
        <p>格式化金额 (123456.789): {{ formatCurrency(123456.789) }}</p>
        <p>格式化数字 (1000000): {{ formatNumber(1000000) }}</p>
        <p>手机号脱敏 (13800138000): {{ maskPhone('13800138000') }}</p>
      </div>
    </BaseCard>

    <BaseCard title="通用工具 (utils/common.ts)">
      <div class="demo-item space-y-2">
        <div class="flex items-center gap-3">
          <span>点击防抖测试:</span>
          <BaseButton size="sm" @click="handleDebounceClick">点击我 ({{ debounceCount }})</BaseButton>
        </div>
        <div class="flex items-center gap-3">
          <span>点击节流测试:</span>
          <BaseButton size="sm" variant="secondary" @click="handleThrottleClick">点击我 ({{ throttleCount }})</BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="错误处理演示 (plugins/error-handler.ts)">
      <div class="demo-item">
        <p>请打开控制台查看日志输出</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <BaseButton variant="danger" @click="triggerVueError">触发 Vue 错误</BaseButton>
          <BaseButton variant="danger" @click="triggerPromiseError">触发 Promise 错误</BaseButton>
          <BaseButton variant="danger" @click="triggerManualError">手动记录错误</BaseButton>
          <BaseButton variant="danger" @click="triggerThrowError">直接抛出异常</BaseButton>
        </div>
      </div>
    </BaseCard>

    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
const { $logError } = useNuxtApp()
// Use useState to ensure consistent time between server and client hydration
const now = useState<number>('utils-demo-now', () => Date.now())
const fiveMinutesAgo = computed(() => new Date(now.value - 5 * 60 * 1000))

const debounceCount = ref(0)
const throttleCount = ref(0)

const handleDebounceClick = debounce(() => {
  debounceCount.value++
}, 500)

const handleThrottleClick = throttle(() => {
  throttleCount.value++
}, 1000)

// 错误处理演示方法
const triggerVueError = () => {
  // @ts-ignore - 故意调用不存在的方法
  undefinedFunction()
}

const triggerPromiseError = () => {
  new Promise((_, reject) => {
    reject(new Error('这是一个未捕获的 Promise 错误'))
  })
}

const triggerManualError = () => {
  try {
    throw new Error('这是一个被捕获并手动记录的错误')
  } catch (e) {
    $logError(e, '用户触发的手动错误')
  }
}

const triggerThrowError = () => {
  throw new Error('这是一个直接抛出的常规错误')
}
</script>

<style scoped>
.utils-demo {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.demo-item p {
  margin: 0.5rem 0;
}
</style>

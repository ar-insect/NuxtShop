<template>
  <div class="max-w-5xl mx-auto space-y-12">
    <div class="border-b pb-5" :style="{ borderColor: 'var(--border-color)' }">
      <h1 class="text-3xl font-bold leading-tight" :style="{ color: 'var(--text-color)' }">全局组件</h1>
      <p class="mt-2 text-lg" :style="{ color: 'var(--text-secondary)' }">
        展示应用中可重用的 UI 组件。
      </p>
    </div>
    
    <!-- Modal Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">模态框 (BaseModal)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">交互式</span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          一个完全可访问的模态框组件，支持自定义标题、内容和操作。
          支持点击背景关闭和 ESC 键导航。
        </p>
        <div class="flex items-center gap-4">
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none"
            @click="showModal = true"
          >
            打开模态框
          </button>
        </div>
        
        <BaseModal
          v-model="showModal"
          title="演示模态框"
          @confirm="handleModalConfirm"
          @cancel="handleModalCancel"
        >
          <div class="space-y-4">
            <p class="text-[var(--text-secondary)]">
              这是全局模态框组件的内容。它可以包含任何 HTML 或其他组件。
            </p>
            <div class="p-4 rounded-lg border bg-[var(--muted-bg)] border-[var(--border-color)]">
              <p class="text-sm text-[var(--text-color)]">
                <strong>提示：</strong> 如果需要，您可以传递自定义的头部和底部插槽。
              </p>
            </div>
          </div>
        </BaseModal>
      </div>
    </section>

    <!-- Loading Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">加载状态 (BaseLoading)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">工具</span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          一个灵活的加载覆盖层，可以覆盖特定容器或整个屏幕。
        </p>
        
        <div class="relative h-64 rounded-lg border border-dashed flex items-center justify-center mb-6 overflow-hidden bg-[var(--muted-bg)] border-[var(--border-color)]">
          <div class="text-center p-6">
            <h3 class="text-lg font-medium mb-2 text-[var(--text-color)]">内容容器</h3>
            <p class="max-w-sm mx-auto text-[var(--text-secondary)]">
              此区域代表数据获取组件。点击下方按钮模拟加载状态。
            </p>
          </div>
          
          <!-- Loading Component -->
          <BaseLoading :loading="loading" text="正在获取数据..." />
        </div>

        <button 
          :disabled="loading"
          class="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-[var(--hover-bg)] bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-color)]"
          @click="toggleLoading"
        >
          {{ loading ? '加载中...' : '切换加载状态' }}
        </button>
      </div>
    </section>

    <!-- Toast Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">Toast 通知 (BaseToast)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">反馈</span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          用于向用户提供反馈的非阻塞通知。 
          使用 <code>useToast</code> 组合式函数，可从任何地方轻松触发。
        </p>
        
        <div class="flex flex-wrap gap-4">
          <BaseButton 
            variant="success"
            @click="toast.success('操作成功完成！')"
          >
            成功 Toast
          </BaseButton>
          
          <BaseButton 
            variant="danger"
            @click="toast.error('出错了！')"
          >
            错误 Toast
          </BaseButton>
          
          <BaseButton 
            variant="secondary"
            @click="toast.info('这是一些信息。')"
          >
            信息 Toast
          </BaseButton>
          
          <BaseButton 
            variant="outline"
            @click="toast.warning('警告：请谨慎操作。')"
          >
            警告 Toast
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- Confirm Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">确认框 (BaseConfirm)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">交互式</span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          用于关键操作确认的对话框，支持异步调用。
          使用 <code>useConfirm</code> 组合式函数，返回 Promise。
        </p>
        
        <div class="flex flex-wrap gap-4">
          <BaseButton 
            variant="danger"
            @click="handleConfirmDelete"
          >
            删除操作
          </BaseButton>
          
          <BaseButton 
            variant="outline"
            @click="handleConfirmWarning"
          >
            警告提示
          </BaseButton>
          
          <BaseButton 
            variant="secondary"
            @click="handleConfirmInfo"
          >
            信息确认
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- BaseButton Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">按钮 (BaseButton)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">交互式</span>
      </div>
      <div class="p-6 space-y-8">
        <!-- Variants -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">变体</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton>主要</BaseButton>
            <BaseButton variant="secondary">次要</BaseButton>
            <BaseButton variant="outline">轮廓</BaseButton>
            <BaseButton variant="danger">危险</BaseButton>
            <BaseButton variant="success">成功</BaseButton>
            <BaseButton variant="ghost">幽灵</BaseButton>
          </div>
        </div>

        <!-- Sizes -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">尺寸</h3>
          <div class="flex flex-wrap items-center gap-4">
            <BaseButton size="xs">XS 按钮</BaseButton>
            <BaseButton size="sm">小</BaseButton>
            <BaseButton size="md">中</BaseButton>
            <BaseButton size="lg">大</BaseButton>
            <BaseButton size="xl">特大</BaseButton>
          </div>
        </div>

        <!-- States -->
        <div>
          <h3 class="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text-secondary)]">状态</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton :loading="true">加载中</BaseButton>
            <BaseButton disabled>禁用</BaseButton>
            <BaseButton disabled variant="secondary">禁用次要</BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- BaseInput Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">表单输入 (BaseInput)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">表单</span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput 
            v-model="inputValues.username" 
            label="用户名" 
            placeholder="输入您的用户名"
            hint="这将是您的公开显示名称。"
          />
          
          <BaseInput 
            v-model="inputValues.email" 
            label="邮箱" 
            type="email" 
            placeholder="you@example.com"
          />

          <BaseInput 
            v-model="inputValues.password" 
            label="密码" 
            type="password" 
            placeholder="请输入密码"
          />

          <BaseInput 
            v-model="inputValues.error" 
            label="错误状态" 
            placeholder="出错了..."
            error="此字段为必填项"
          />

          <BaseInput 
            v-model="inputValues.search" 
            label="带前缀" 
            placeholder="搜索..."
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :style="{ color: 'var(--text-secondary)' }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </template>
          </BaseInput>

          <BaseInput 
            v-model="inputValues.disabled" 
            label="禁用" 
            placeholder="无法编辑"
            disabled
          />
        </div>
      </div>
    </section>

    <!-- Select Demo -->
    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">下拉选择 (BaseSelect)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">表单</span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseSelect 
            v-model="selectValues.single" 
            label="单选" 
            :options="selectOptions"
            placeholder="请选择一个选项"
            clearable
          />
          
          <BaseSelect 
            v-model="selectValues.multiple" 
            label="多选" 
            :options="selectOptions"
            placeholder="请选择多个选项"
            multiple
            clearable
          />

          <BaseSelect 
            v-model="selectValues.disabled" 
            label="禁用状态" 
            :options="selectOptions"
            disabled
            placeholder="无法选择"
          />
        </div>
        <div class="mt-4 text-sm text-[var(--text-secondary)]">
          <p>单选值: {{ selectValues.single }}</p>
          <p>多选值: {{ selectValues.multiple }}</p>
        </div>
      </div>
    </section>

    <!-- Dropdown & Carousel Demo -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Dropdown -->
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-medium text-[var(--text-color)]">下拉菜单 (BaseDropdown)</h2>
          <span class="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">交互</span>
        </div>
        <div class="p-6 flex justify-center items-start h-48">
          <BaseDropdown label="操作菜单">
            <template #default="{ close }">
              <a href="#" class="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--hover-bg)]" @click.prevent="close">查看详情</a>
              <a href="#" class="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--hover-bg)]" @click.prevent="close">编辑内容</a>
              <div class="border-t border-[var(--border-color)] my-1"></div>
              <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click.prevent="close">删除项目</a>
            </template>
          </BaseDropdown>
        </div>
      </div>

      <!-- Carousel -->
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-medium text-[var(--text-color)]">轮播图 (BaseCarousel)</h2>
          <span class="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">展示</span>
        </div>
        <div class="p-6">
          <div class="h-48 rounded-lg overflow-hidden">
            <BaseCarousel :items="carouselItems" indicators controls autoplay>
              <template #default="{ item }">
                <div class="w-full h-full flex items-center justify-center text-white text-xl font-bold" :class="item.bg">
                  {{ item.title }}
                </div>
              </template>
            </BaseCarousel>
          </div>
        </div>
      </div>
    </section>

    <!-- BaseCard Demo -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-[var(--text-color)]">卡片组件 (BaseCard)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">容器</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard title="简单卡片" subtitle="带副标题">
          <p class="text-[var(--text-secondary)]">
            这是一个带有标题和副标题的简单卡片组件。它使用默认插槽作为内容。
          </p>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-[var(--text-color)]">自定义头部</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                活跃
              </span>
            </div>
          </template>
          <p class="text-[var(--text-secondary)]">
            此卡片具有用于更复杂布局的自定义头部插槽。
          </p>
          <template #footer>
            <div class="flex justify-end">
              <BaseButton size="sm" variant="outline">查看详情</BaseButton>
            </div>
          </template>
        </BaseCard>
      </div>
    </section>

    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">分页 (BasePagination)</h2>
        <span class="px-2 py-1 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">导航</span>
      </div>
      <div class="p-6 space-y-8">
        <div class="space-y-3">
          <div class="text-sm font-medium text-[var(--text-color)]">事件模式（v-model）</div>
          <div class="flex justify-center">
            <BasePagination v-model="demoPage" :total-pages="demoTotalPages" />
          </div>
          <div class="text-sm text-[var(--text-secondary)]">
            当前页：{{ demoPage }} / {{ demoTotalPages }}
          </div>
          <div class="flex flex-wrap gap-3">
            <BaseButton size="sm" variant="outline" @click="demoTotalPages = 6">总页数=6</BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoTotalPages = 24">总页数=24</BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoPage = 1">跳到第 1 页</BaseButton>
            <BaseButton size="sm" variant="outline" @click="demoPage = Math.min(demoTotalPages, 10)">跳到第 10 页</BaseButton>
          </div>
        </div>

        <div class="pt-6 border-t border-[var(--border-color)] space-y-3">
          <div class="text-sm font-medium text-[var(--text-color)]">路由模式（通过 getTo 生成 NuxtLink）</div>
          <div class="flex justify-center">
            <BasePagination :model-value="routeDemoPage" :total-pages="routeDemoTotalPages" :get-to="routeDemoTo" />
          </div>
          <div class="text-sm text-[var(--text-secondary)]">
            当前 query.demoPage：{{ routeDemoPage }}
          </div>
        </div>
      </div>
    </section>

    <!-- Advanced Components Demo -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-[var(--text-color)]">高级组件</h2>
        <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">实验性</span>
      </div>
      
      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
        <h3 class="text-lg font-medium text-[var(--text-color)] mb-4">TSX 组件 (TsxButton)</h3>
        <p class="text-[var(--text-secondary)] mb-4">
          用 TSX (Vue 的 JSX) 编写的组件，演示了完整的 TypeScript 支持。
        </p>
        <div class="flex gap-4">
          <TsxButton>默认 TSX 按钮</TsxButton>
          <TsxButton variant="primary">主要 TSX 按钮</TsxButton>
        </div>
      </div>

      <div class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
        <h3 class="text-lg font-medium text-[var(--text-color)] mb-4">样式组件 (StyledButton)</h3>
        <p class="text-[var(--text-secondary)] mb-4">
          使用 <code>vue3-styled-components</code> 构建的组件，用于 CSS-in-JS 样式。
        </p>
        <div class="flex gap-4 items-center">
          <StyledButton>默认样式</StyledButton>
          <StyledButton :primary="true">主要样式</StyledButton>
        </div>
      </div>
    </section>

    <div class="flex justify-center pt-8">
      <NuxtLink 
        to="/" 
        class="font-medium flex items-center gap-2 transition-colors hover:text-[var(--primary-color)] text-[var(--text-secondary)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        返回首页
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseDropdown from '~/components/ui/BaseDropdown.vue'
import BaseCarousel from '~/components/ui/BaseCarousel.vue'

// Modal
const showModal = ref(false)
const toast = useToast()

const handleModalConfirm = () => {
  showModal.value = false
  toast.success('确认成功')
}

const handleModalCancel = () => {
  showModal.value = false
  toast.info('操作已取消')
}

// Confirm Demo
const { confirm } = useConfirm()

const handleConfirmDelete = async () => {
  const isConfirmed = await confirm({
    title: '确认删除',
    message: '您确定要执行此删除操作吗？该操作无法撤销。',
    type: 'danger',
    confirmText: '确认删除',
    cancelText: '取消'
  })
  
  if (isConfirmed) {
    toast.success('删除成功')
  } else {
    toast.info('已取消删除')
  }
}

const handleConfirmWarning = async () => {
  const isConfirmed = await confirm({
    title: '温馨提示',
    message: '继续操作可能会导致数据变更，是否继续？',
    type: 'warning'
  })
  
  if (isConfirmed) {
    toast.success('已确认继续')
  } else {
    toast.info('已取消操作')
  }
}

const handleConfirmInfo = async () => {
  const isConfirmed = await confirm({
    title: '确认信息',
    message: '请确认您的个人信息是否正确。',
    type: 'info'
  })
  
  if (isConfirmed) {
    toast.success('已确认信息')
  } else {
    toast.info('已取消信息确认')
  }
}

// Loading
const loading = ref(false)
const toggleLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.success('加载完成')
  }, 2000)
}

const inputValues = reactive({
  username: '',
  email: '',
  password: '',
  error: '',
  search: '',
  disabled: ''
})

const demoTotalPages = ref(24)
const demoPage = ref(3)

const route = useRoute()
const routeDemoTotalPages = ref(18)
const routeDemoPage = computed(() => {
  const v = route.query.demoPage
  const n = typeof v === 'string' ? Number(v) : 1
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
})

const routeDemoTo = (page: number) => {
  return { path: '/components-demo', query: { ...route.query, demoPage: page } }
}

const selectValues = reactive({
  single: '',
  multiple: [],
  disabled: ''
})

const selectOptions = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'svelte' }
]

const carouselItems = [
  { title: 'Slide 1', bg: 'bg-red-500' },
  { title: 'Slide 2', bg: 'bg-green-500' },
  { title: 'Slide 3', bg: 'bg-blue-500' }
]
</script>

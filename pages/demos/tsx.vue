<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="border-b pb-5" :style="{ borderColor: 'var(--border-color)' }">
      <h1 class="text-3xl font-bold leading-tight" :style="{ color: 'var(--text-color)' }">TSX 支持演示</h1>
      <p class="mt-2 text-lg" :style="{ color: 'var(--text-secondary)' }">
        在 Nuxt 3 中使用 Vue 3 的 JSX/TSX 语法。
      </p>
    </div>

    <!-- Live Demo Card -->
    <div class="card overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4">
        <h2 class="text-lg font-medium text-[var(--text-color)]">实时组件</h2>
      </div>
      <div class="p-8 flex items-center justify-center bg-[var(--bg-color)]">
        <TsxHello message="来自 TSX 的问候！" />
      </div>
    </div>

    <!-- Code Example -->
    <div class="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex justify-between items-center">
        <h2 class="text-sm font-medium text-[var(--text-secondary)]">components/TsxHello.tsx</h2>
        <span class="text-xs text-[var(--text-secondary)]">TypeScript</span>
      </div>
      <div class="p-6 overflow-x-auto bg-[var(--muted-bg)]">
        <pre class="text-sm font-mono text-[var(--text-color)]"><code>import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TsxHello',
  props: {
    message: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => (
      &lt;div class="p-4 bg-blue-100 text-blue-800 rounded-lg shadow-sm border border-blue-200"&gt;
        &lt;h3 class="font-bold text-lg mb-2"&gt;TSX Component&lt;/h3&gt;
        &lt;p&gt;{props.message}&lt;/p&gt;
      &lt;/div&gt;
    )
  }
})</code></pre>
      </div>
    </div>

    <!-- Info Section -->
    <div class="rounded-xl p-6 border" :style="{ backgroundColor: 'var(--muted-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5" :style="{ color: 'var(--text-secondary)' }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">为什么使用 TSX？</h3>
          <div class="mt-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
            <p>
              TSX 非常适合模板变得难以处理的复杂渲染逻辑。
              它在渲染函数中提供完整的 TypeScript 支持，并允许您使用 JavaScript 的全部功能。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TsxHello is auto-imported
</script>

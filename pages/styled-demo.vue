<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="border-b pb-5" :style="{ borderColor: 'var(--border-color)' }">
      <h1 class="text-3xl font-bold leading-tight" :style="{ color: 'var(--text-color)' }">样式组件演示</h1>
      <p class="mt-2 text-lg" :style="{ color: 'var(--text-secondary)' }">
        使用 vue3-styled-components 为 Vue 3 提供 CSS-in-JS 样式。
      </p>
    </div>

    <!-- Live Demo Card -->
    <div class="card overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4">
        <h2 class="text-lg font-medium text-[var(--text-color)]">实时组件</h2>
      </div>
      <div class="p-8 flex flex-col items-center justify-center bg-[var(--bg-color)] gap-6">
        <div class="flex items-center gap-4">
          <StyledButton>普通按钮</StyledButton>
          <StyledButton primary>主要按钮</StyledButton>
        </div>
        <p class="text-sm text-[var(--text-secondary)]">
          尝试悬停在按钮上以查看样式组件中定义的过渡效果。
        </p>
      </div>
    </div>

    <!-- Code Example -->
    <div class="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex justify-between items-center">
        <h2 class="text-sm font-medium text-[var(--text-secondary)]">components/StyledButton.ts</h2>
        <span class="text-xs text-[var(--text-secondary)]">TypeScript</span>
      </div>
      <div class="p-6 overflow-x-auto bg-[var(--muted-bg)]">
        <pre class="text-sm font-mono text-[var(--text-color)]"><code>import styled from 'vue3-styled-components'

const btnProps = {
  primary: {
    type: Boolean,
    default: false
  }
}

const StyledButton = styled('button', btnProps)`
  background: ${props => props.primary ? '#00dc82' : 'white'};
  color: ${props => props.primary ? 'white' : '#00dc82'};
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #00dc82;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(0);
  }
`

export default StyledButton</code></pre>
      </div>
    </div>

    <!-- TSX Integration Section -->
    <div class="border-b pb-5 pt-8" :style="{ borderColor: 'var(--border-color)' }">
      <h2 class="text-2xl font-bold leading-tight" :style="{ color: 'var(--text-color)' }">带 TSX 的样式组件</h2>
      <p class="mt-2 text-lg" :style="{ color: 'var(--text-secondary)' }">
        在 TSX 文件中使用样式组件以实现强大的组件组合。
      </p>
    </div>

    <!-- TSX Live Demo -->
    <div class="card overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4">
        <h2 class="text-lg font-medium text-[var(--text-color)]">TSX 组件演示</h2>
      </div>
      <div class="p-8 flex flex-col items-center justify-center bg-[var(--bg-color)] gap-6">
        <div class="flex flex-wrap gap-4 justify-center">
          <StyledTsxButton label="主要" variant="primary" />
          <StyledTsxButton label="成功" variant="success" />
          <StyledTsxButton label="警告" variant="warning" />
          <StyledTsxButton label="危险" variant="danger" />
        </div>
      </div>
    </div>

    <!-- TSX Code Example -->
    <div class="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex justify-between items-center">
        <h2 class="text-sm font-medium text-[var(--text-secondary)]">components/StyledTsxButton.tsx</h2>
        <span class="text-xs text-[var(--text-secondary)]">TSX</span>
      </div>
      <div class="p-6 overflow-x-auto bg-[var(--muted-bg)]">
        <pre class="text-sm font-mono text-[var(--text-color)]"><code>import { defineComponent } from 'vue'
import styled from 'vue3-styled-components'

const btnProps = {
  variant: {
    type: String,
    default: 'primary'
  }
}

const ButtonContainer = styled('button', btnProps)`
  /* styles based on variant */
  background: ${props => {
    switch(props.variant) {
      case 'danger': return '#ef4444';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
  /* ... other styles */
`

export default defineComponent({
  name: 'StyledTsxButton',
  props: {
    variant: { type: String, default: 'primary' },
    label: { type: String, required: true }
  },
  setup(props) {
    return () => (
      &lt;ButtonContainer variant={props.variant}&gt;
        {props.label}
      &lt;/ButtonContainer&gt;
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
          <h3 class="text-sm font-medium">关于 Styled Components</h3>
          <div class="mt-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
            <p>
              Styled-components 允许您编写实际的 CSS 代码来为组件设置样式。
              它消除了组件和样式之间的映射——使用组件作为低级样式构造。
            </p>
            <p class="mt-2">
              <strong>SSR 说明：</strong> 我们在 <code>app.vue</code> 中配置了全局 <code>ThemeProvider</code>，以确保样式正确注入并避免 hydration 警告。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StyledButton from '~/components/ui/StyledButton'
import StyledTsxButton from '~/components/ui/StyledTsxButton'
</script>

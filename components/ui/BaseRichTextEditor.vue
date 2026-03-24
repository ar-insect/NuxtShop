<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium mb-1" :style="{ color: 'var(--text-color)' }">
      {{ label }}
      <span v-if="required" class="ml-0.5 text-red-500">*</span>
    </label>

    <div class="rich-editor-shell rounded-xl border bg-[var(--card-bg)] text-sm overflow-hidden transition-all duration-200">
      <div
        class="flex flex-wrap items-center gap-1 border-b px-2 py-1 text-xs"
        :style="{
          borderColor: 'var(--border-color)',
          backgroundColor: 'color-mix(in srgb, var(--card-bg), var(--bg-color) 25%)'
        }"
      >
        <button
          v-for="action in actions"
          :key="action.key"
          type="button"
          class="toolbar-btn inline-flex items-center gap-1 rounded px-2 py-0.5 border text-[11px]"
          @mousedown.prevent
          @click="applyAction(action.key)"
        >
          <span>{{ action.label }}</span>
        </button>
      </div>

      <div
        ref="editorRef"
        class="editor-content min-h-[200px] max-h-[480px] px-3 py-2 overflow-y-auto outline-none"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>

    <p v-if="hint" class="mt-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)

const actions = [
  { key: 'bold', label: 'B' },
  { key: 'italic', label: 'I' },
  { key: 'h2', label: '标题 1' },
  { key: 'h3', label: '标题 2' },
  { key: 'ul', label: '• List' },
  { key: 'ol', label: '1. List' },
  { key: 'quote', label: '“ ”' },
  { key: 'clear', label: '清除格式' }
] as const

const syncFromModel = () => {
  if (!editorRef.value) return
  const html = props.modelValue || ''
  if (editorRef.value.innerHTML !== html) {
    editorRef.value.innerHTML = html
  }
}

watch(
  () => props.modelValue,
  () => {
    syncFromModel()
  }
)

onMounted(() => {
  syncFromModel()
})

const handleInput = () => {
  if (!editorRef.value) return
  emit('update:modelValue', editorRef.value.innerHTML)
}

const handleBlur = () => {
  emit('blur')
}

const applyAction = (key: (typeof actions)[number]['key']) => {
  const editor = editorRef.value
  if (!editor) return

  editor.focus()

  const commandMap: Record<string, [string, string | null]> = {
    bold: ['bold', null],
    italic: ['italic', null],
    h2: ['formatBlock', 'H2'],
    h3: ['formatBlock', 'H3'],
    ul: ['insertUnorderedList', null],
    ol: ['insertOrderedList', null],
    quote: ['formatBlock', 'BLOCKQUOTE'],
    clear: ['removeFormat', null]
  }

  const conf = commandMap[key]
  if (!conf) return

  const [command, value] = conf
  try {
    document.execCommand(command, false, value || undefined)
    handleInput()
  } catch {
  }
}
</script>

<style scoped>
[contenteditable='true'][data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: var(--text-secondary);
  opacity: 0.7;
}

.editor-content {
  white-space: pre-wrap;
}

.editor-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0.35rem 0;
}

.editor-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.35rem 0;
}

.editor-content li + li {
  margin-top: 0.15rem;
}

.editor-content h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.35rem;
}

.editor-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.6rem 0 0.3rem;
}

.editor-content blockquote {
  border-left: 3px solid var(--border-color);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.toolbar-btn {
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.toolbar-btn:hover {
  background-color: color-mix(in srgb, var(--primary-color) 6%, transparent);
  color: var(--primary-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.toolbar-btn:active {
  transform: translateY(1px) translateX(0.5px) scale(0.97);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.rich-editor-shell {
  border-color: var(--border-color);
}

.rich-editor-shell:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 18%, transparent);
}
</style>

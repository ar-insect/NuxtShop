<template>
  <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
    <div class="space-y-3">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 flex-1">
          <slot name="primary" />
        </div>
        <div class="flex items-center justify-end gap-2 whitespace-nowrap">
          <BaseButton
            size="sm"
            variant="primary"
            class="px-4"
            @click="emit('search')"
          >
            {{ searchLabel }}
          </BaseButton>
          <BaseButton
            size="sm"
            variant="secondary"
            class="px-4"
            @click="emit('reset')"
          >
            {{ resetLabel }}
          </BaseButton>
          <BaseButton
            v-if="$slots.more"
            size="xs"
            variant="ghost"
            class="hidden md:inline-flex text-[var(--text-secondary)]"
            @click="toggleMore"
          >
            <span class="text-[11px]">
              {{ showMore ? hideMoreLabelComputed : moreLabelComputed }}
            </span>
          </BaseButton>
        </div>
      </div>

      <div
        v-if="showMore && $slots.more"
        class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3"
      >
        <slot name="more" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  searchLabel: string
  resetLabel: string
  moreLabel?: string
  hideMoreLabel?: string
}>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()

const showMore = ref(false)

const moreLabelComputed = computed(() => props.moreLabel || '更多')
const hideMoreLabelComputed = computed(() => props.hideMoreLabel || '收起')

const toggleMore = () => {
  showMore.value = !showMore.value
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col relative"
    :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }"
  >
    <div class="absolute top-4 left-4 z-20">
      <NuxtLink
        to="/"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition-all hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.28)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      >
        <SvgIcon name="home" class="h-5 w-5 text-slate-600" />
      </NuxtLink>
    </div>

    <div class="flex-1">
      <slot />
    </div>
    
    <BaseToast />
    <BaseModal />
  </div>
</template>

<script setup lang="ts">
import BaseToast from '~/components/ui/BaseToast.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import SvgIcon from '~/components/ui/SvgIcon.vue'
</script>

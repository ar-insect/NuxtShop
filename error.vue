<template>
  <NuxtLayout>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <div class="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
        <h1 class="text-6xl font-bold text-red-500 mb-4">{{ error.statusCode }}</h1>
        <h2 class="text-2xl font-semibold mb-4">{{ errorMessage }}</h2>
        <p class="text-gray-600 mb-6">{{ errorDescription }}</p>

        <div class="space-x-4">
          <NuxtLink to="/" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            返回首页
          </NuxtLink>
          <button @click="handleClearError" class="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
            刷新页面
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  error: {
    url: string;
    statusCode: number;
    statusMessage: string;
    message: string;
    description: string;
    data: any;
  };
}>();

const errorMessage = computed(() => {
  if (props.error.statusCode === 404) {
    return '页面未找到';
  } else if (props.error.statusCode === 500) {
    return '服务器内部错误';
  }
  return props.error.statusMessage || '发生未知错误';
});

const errorDescription = computed(() => {
  if (props.error.statusCode === 404) {
    return `抱歉，您访问的页面 "${props.error.url}" 不存在。`;
  } else if (props.error.statusCode === 500) {
    return '抱歉，服务器在处理您的请求时遇到了问题。请稍后再试。';
  }
  return props.error.message || '请检查您的网络连接或稍后再试。';
});

const handleClearError = () => {
  clearError({ redirect: '/' });
};
</script>

<style scoped>
/* 可以根据需要添加一些样式 */
</style>

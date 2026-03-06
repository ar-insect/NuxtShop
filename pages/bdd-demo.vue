<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-center mb-12 text-[var(--text-color)]">BDD 测试演示</h1>

    <section class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">测试用例列表</h2>
        <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">测试</span>
      </div>
      <div class="p-6">
        <p class="mb-6 text-[var(--text-secondary)]">
          展示 Playwright BDD 测试用例。您可以单独运行每个用例，或批量运行所有用例。
        </p>

        <div class="flex items-center gap-4 mb-6">
          <BaseButton :loading="fetchingFeatures" @click="fetchFeatures">
            <template v-if="fetchingFeatures">加载中...</template>
            <template v-else>刷新测试用例</template>
          </BaseButton>
          <BaseButton variant="primary" :loading="runningAllTests" :disabled="!featureFiles.length" @click="runAllTests">
            <template v-if="runningAllTests">运行所有测试中...</template>
            <template v-else>运行所有测试</template>
          </BaseButton>
        </div>

        <div v-if="featureFiles.length" class="space-y-4">
          <div v-for="feature in featureFiles" :key="feature" class="flex items-center justify-between p-3 border rounded-lg bg-[var(--muted-bg)] border-[var(--border-color)]">
            <span class="font-medium text-[var(--text-color)]">{{ feature }}.feature</span>
            <BaseButton size="sm" :loading="runningTest === feature" @click="runTest(feature)">
              <template v-if="runningTest === feature">运行中...</template>
              <template v-else>运行</template>
            </BaseButton>
          </div>
        </div>
        <div v-else-if="!fetchingFeatures" class="text-[var(--text-secondary)]">
          没有找到 .feature 测试文件。请确保文件位于 `tests/e2e/features` 目录下。
        </div>

        <section v-if="testReport" class="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden mt-8">
          <div class="border-b border-[var(--border-color)] bg-[var(--muted-bg)] px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-[var(--text-color)]">测试报告</h2>
        <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">BDD</span>
      </div>
          <div class="p-6">
            <pre class="bg-gray-800 text-[var(--text-color)] p-4 rounded-lg overflow-auto text-sm">{{ stripAnsiCodes(testReport) }}</pre>
          </div>
        </section>
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
import { ref, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const stripAnsiCodes = (text: string) => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}

const featureFiles = ref<string[]>([])
const fetchingFeatures = ref(false)
const runningTest = ref<string | null>(null)
const runningAllTests = ref(false)
const testReport = ref<string | null>(null)

const fetchFeatures = async () => {
  fetchingFeatures.value = true
  try {
    const response = await $fetch<{ success: boolean, data: string[] }>('/api/tests/features')
    if (response.success) {
      featureFiles.value = response.data
    } else {
      toast.error('获取测试用例失败')
    }
  } catch (error) {
    console.error('Failed to fetch feature files:', error)
    toast.error('获取测试用例失败')
  } finally {
    fetchingFeatures.value = false
  }
}

const runTest = async (feature: string) => {
  runningTest.value = feature
  testReport.value = null
  try {
    const response = await $fetch<{ success: boolean, report: string }>('/api/tests/run', {
      method: 'POST',
      body: { feature }
    })
    if (response.success) {
      testReport.value = response.report
      toast.success(`${feature}.feature 测试运行完成`)
    } else {
      toast.error(`${feature}.feature 测试运行失败`)
    }
  } catch (error) {
    console.error(`Failed to run ${feature}.feature test:`, error)
    toast.error(`${feature}.feature 测试运行失败`)
  } finally {
    runningTest.value = null
  }
}

const runAllTests = async () => {
  runningAllTests.value = true
  testReport.value = null
  try {
    const response = await $fetch<{ success: boolean, report: string }>('/api/tests/run', {
      method: 'POST',
      body: { feature: 'all' }
    })
    if (response.success) {
      testReport.value = response.report
      toast.success('所有测试运行完成')
    } else {
      toast.error('所有测试运行失败')
    }
  } catch (error) {
    console.error('Failed to run all tests:', error)
    toast.error('所有测试运行失败')
  } finally {
    runningAllTests.value = false
  }
}

onMounted(() => {
  fetchFeatures()
})
</script>

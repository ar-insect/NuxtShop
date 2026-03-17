<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t, locale } = useI18n()

const isEnglish = computed(() => locale.value === 'en-US')

const { data: pageZh } = await useAsyncData('docs-zh', () => {
  return queryCollection('content').path('/').first()
})

const { data: pageEn } = await useAsyncData('docs-en', () => {
  return queryCollection('content').path('/index-en').first()
})

const currentPage = computed(() => (isEnglish.value ? pageEn.value : pageZh.value))
const tocPage = computed(() => (isEnglish.value ? pageEn.value : pageZh.value))

useSeoMeta({
  title: () => t('seo.docs.title'),
  description: () => t('seo.docs.description')
})

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    history.pushState(null, '', `#${id}`)
  }
}
</script>

<template>
  <ClientOnly>
    <div class="docs-page">
      <div class="container">
        <div class="layout-grid">
          <!-- 主内容 -->
          <main class="content-wrapper">
            <ContentRenderer v-if="currentPage" :value="currentPage" class="markdown-body" />
            <div v-else class="empty-state">
              {{ t('docs.empty') }}
            </div>
            
            <div class="navigation">
              <NuxtLink to="/" class="back-link">
                {{ t('docs.backHome') }}
              </NuxtLink>
            </div>
          </main>

          <!-- 右侧 TOC（根据当前语言使用对应文档的 TOC） -->
          <aside v-if="tocPage?.body?.toc?.links?.length" class="toc-sidebar">
            <div class="toc-wrapper">
              <h3 class="toc-title">{{ t('docs.tocTitle') }}</h3>
              <nav class="toc-nav">
                <ul>
                  <li v-for="link in tocPage.body.toc.links" :key="link.id">
                    <a :href="`#${link.id}`" @click.prevent="scrollToHeading(link.id)">{{ link.text }}</a>
                    <ul v-if="link.children && link.children.length">
                      <li v-for="child in link.children" :key="child.id">
                        <a :href="`#${child.id}`" @click.prevent="scrollToHeading(child.id)">{{ child.text }}</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.docs-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr 250px;
    align-items: start;
  }
  
  .toc-sidebar {
    position: sticky;
    top: 2rem;
  }
}

.content-wrapper {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-color);
  min-width: 0; /* 防止 grid溢出 */
}

.toc-wrapper {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.toc-title {
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.toc-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-nav li {
  margin-bottom: 0.5rem;
}

.toc-nav a {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: block;
  padding: 0.25rem 0;
  transition: all 0.2s;
  line-height: 1.4;
}

.toc-nav a:hover {
  color: var(--primary-color);
  padding-left: 0.25rem;
}

.toc-nav ul ul {
  padding-left: 1rem;
  margin-top: 0.25rem;
  border-left: 2px solid var(--border-color);
}

.navigation {
  margin-top: 2rem;
  text-align: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ef4444;
  font-size: 1.1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
}

.back-link:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

/* Markdown Styles */
:deep(.markdown-body) {
  color: var(--text-color);
  line-height: 1.6;
}

:deep(.markdown-body h1) {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

:deep(.markdown-body h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-top: 2rem;
  margin-bottom: 1rem;
}

:deep(.markdown-body h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.markdown-body p) {
  margin-bottom: 1rem;
}

:deep(.markdown-body ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

:deep(.markdown-body ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

:deep(.markdown-body li) {
  margin-bottom: 0.5rem;
}

:deep(.markdown-body code) {
  background-color: var(--muted-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

:deep(.markdown-body pre) {
  background-color: var(--muted-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

:deep(.markdown-body pre code) {
  background-color: transparent;
  color: var(--text-color);
  padding: 0;
  border: 0;
}

:deep(.markdown-body a) {
  color: #3b82f6;
  text-decoration: none;
}

:deep(.markdown-body a:hover) {
  text-decoration: underline;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid var(--border-color);
  padding-left: 1rem;
  margin-left: 0;
  color: var(--text-secondary);
  font-style: italic;
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

:deep(.markdown-body th) {
  background-color: var(--muted-bg);
  font-weight: 600;
}
</style>

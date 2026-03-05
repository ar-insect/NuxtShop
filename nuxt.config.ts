import fs from 'node:fs'
import path from 'node:path'

// Nuxt 配置文档：https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  build: {
    transpile: ['vue3-styled-components']
  },
  devServer: {
    port: 4000
  },
  // 将 README.md 同步到 content/index.md
  hooks: {
    'build:before': () => {
      const readmePath = path.resolve(process.cwd(), 'README.md')
      const contentPath = path.resolve(process.cwd(), 'content/index.md')
      if (fs.existsSync(readmePath)) {
        fs.copyFileSync(readmePath, contentPath)
      }
    },
    'builder:watch': (event, relativePath) => {
      if (relativePath === 'README.md') {
        const readmePath = path.resolve(process.cwd(), 'README.md')
        const contentPath = path.resolve(process.cwd(), 'content/index.md')
        if (fs.existsSync(readmePath)) {
          fs.copyFileSync(readmePath, contentPath)
          // 如有需要可触发 content/index.md 的 HMR（通常 copy 已足够）
        }
      }
    }
  },
  sourcemap: {
    server: true,
    client: true
  },
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components/ui',
      pathPrefix: false
    },
    {
      path: '~/components/layout',
      pathPrefix: false
    },
    {
      path: '~/components/home',
      pathPrefix: false
    },
    {
      path: '~/components/user',
      pathPrefix: false
    },
    {
      path: '~/components/auth',
      prefix: 'Auth'
    },
    '~/components'
  ],
  extends: [
    './modules/user',
    './modules/product',
    './modules/cart',
    './modules/order'
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxt/content',
    '@nuxt/eslint'
    // '@nuxtjs/tailwindcss'
  ],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
  experimental: {
    appManifest: false
  },
  // 配置 Nuxt Content 的 MDC（Markdown Components）
  mdc: {
    highlight: {
      theme: 'github-dark',
      preload: ['ts', 'js', 'css', 'json', 'vue', 'bash', 'html', 'md', 'yaml']
    }
  },
  routeRules: {
    // 启用 ISR（增量静态再生）
    // 仅在生产环境启用，避免开发环境影响 HMR
    '/docs': { swr: process.env.NODE_ENV === 'production' },
    '/products/**': { swr: process.env.NODE_ENV === 'production' ? 3600 : false },
  },
  nitro: {
    storage: {
      cache: {
        driver: 'redis',
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: Number(process.env.REDIS_DB) || 0,
        base: 'nitro:cache:'
      }
    },
    devStorage: {
      // 开发环境使用内存存储，避免持久化缓存带来的干扰
      cache: {
        driver: 'memory'
      }
    }
  },
  runtimeConfig: {
    // 服务端私有配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: Number(process.env.REDIS_DB) || 0
    },
    public: {
      // 客户端公共配置
      disableCaptcha: process.env.NUXT_PUBLIC_DISABLE_CAPTCHA === '1' || process.env.NODE_ENV === 'test'
    }
  },
  typescript: {
    shim: false
  }
})

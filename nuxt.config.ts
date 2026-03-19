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
      const readmeEnPath = path.resolve(process.cwd(), 'README_EN.md')
      const contentEnPath = path.resolve(process.cwd(), 'content/index-en.md')
      if (fs.existsSync(readmePath)) {
        fs.copyFileSync(readmePath, contentPath)
      }
      if (fs.existsSync(readmeEnPath)) {
        fs.copyFileSync(readmeEnPath, contentEnPath)
      }
    },
    'builder:watch': (event, relativePath) => {
      if (relativePath === 'README.md' || relativePath === 'README_EN.md') {
        const root = process.cwd()
        const readmePath = path.resolve(root, 'README.md')
        const contentPath = path.resolve(root, 'content/index.md')
        const readmeEnPath = path.resolve(root, 'README_EN.md')
        const contentEnPath = path.resolve(root, 'content/index-en.md')

        if (fs.existsSync(readmePath)) {
          fs.copyFileSync(readmePath, contentPath)
        }
        if (fs.existsSync(readmeEnPath)) {
          fs.copyFileSync(readmeEnPath, contentEnPath)
        }
      }
    }
  },
  sourcemap: {
    server: process.env.NODE_ENV === 'production',
    client: process.env.NODE_ENV === 'production'
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
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'nuxtshop'
    },
    public: {
      // 若显式配置 NUXT_PUBLIC_DISABLE_CAPTCHA，则以环境变量为准；
      // 否则在 dev/test 默认关闭验证码，在 production 默认启用。
      disableCaptcha: (() => {
        if (process.env.NUXT_PUBLIC_DISABLE_CAPTCHA != null) {
          return process.env.NUXT_PUBLIC_DISABLE_CAPTCHA === '1'
        }
        return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      })()
    },
    admin: { // 添加 admin 配置
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || '123456',
    }
  },
  typescript: {
    shim: false
  }
})

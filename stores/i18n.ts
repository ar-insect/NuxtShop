import { defineStore } from 'pinia'
import zhCN from '~/locales/zh-CN'
import enUS from '~/locales/en-US'

export type Locale = 'zh-CN' | 'en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
} as const

export type MessageSchema = typeof zhCN

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: 'zh-CN' as Locale
  }),

  actions: {
    initLocale(initial?: Locale) {
      if (initial && messages[initial]) {
        this.locale = initial
        if (import.meta.client) {
          localStorage.setItem('nuxtshop-locale', initial)
        }
        return
      }

      if (!import.meta.client) {
        this.locale = 'zh-CN'
        return
      }

      const saved = localStorage.getItem('nuxtshop-locale') as Locale | null
      if (saved && messages[saved]) {
        this.locale = saved
        return
      }

      const browserLang = navigator.language?.toLowerCase() || 'zh-cn'
      if (browserLang.startsWith('en')) {
        this.locale = 'en-US'
      } else {
        this.locale = 'zh-CN'
      }
    },

    setLocale(locale: Locale) {
      if (!messages[locale]) return
      this.locale = locale
      if (import.meta.client) {
        localStorage.setItem('nuxtshop-locale', locale)
      }
    }
  }
})


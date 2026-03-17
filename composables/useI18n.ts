import { useI18nStore, type Locale } from '~/stores/i18n'
import zhCN from '~/locales/zh-CN'
import enUS from '~/locales/en-US'

type Params = Record<string, string | number>

const getFromPath = (obj: any, path: string): string => {
  const segments = path.split('.')
  let cur: any = obj
  for (const s of segments) {
    if (cur && typeof cur === 'object' && s in cur) {
      cur = cur[s]
    } else {
      return path
    }
  }
  return typeof cur === 'string' ? cur : path
}

const formatMessage = (message: string, params?: Params): string => {
  if (!params) return message
  return Object.keys(params).reduce((acc, key) => {
    const value = String(params[key])
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }, message)
}

export const useI18n = () => {
  const store = useI18nStore()

  const allMessages = {
    'zh-CN': zhCN,
    'en-US': enUS
  } as const

  const t = (key: string, params?: Params): string => {
    const raw = getFromPath(allMessages[store.locale] || allMessages['zh-CN'], key)
    return formatMessage(raw, params)
  }

  const setLocale = (locale: Locale) => {
    store.setLocale(locale)
  }

  return {
    locale: computed(() => store.locale),
    setLocale,
    t
  }
}

import { useI18nStore, type Locale } from '~/stores/i18n'
import zhCN from '~/locales/zh-CN'
import enUS from '~/locales/en-US'

type Params = Record<string, string | number>

/**
 * 从对象路径字符串取文案；找不到则返回原始 key
 * @param obj 文案对象
 * @param path 点号分隔路径
 * @returns 文案字符串或原始 key
 */
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

/**
 * 按 {key} 占位符替换文案中的变量
 * @param message 原始文案
 * @param params 参数字典
 * @returns 格式化后的文案
 */
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

  /**
   * 翻译函数：优先使用当前语言；找不到时返回原始 key
   * @param key 文案 key（点号路径）
   * @param params 占位符参数
   * @returns 文案字符串
   */
  const t = (key: string, params?: Params): string => {
    const raw = getFromPath(allMessages[store.locale] || allMessages['zh-CN'], key)
    return formatMessage(raw, params)
  }

  /**
   * 切换当前语言
   * @param locale 目标语言
   */
  const setLocale = (locale: Locale) => {
    store.setLocale(locale)
  }

  return {
    locale: computed(() => store.locale),
    setLocale,
    t
  }
}

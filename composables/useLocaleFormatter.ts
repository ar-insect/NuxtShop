import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '#imports'

export function useLocaleFormatter() {
  const { locale } = useI18n()
  const { user } = useAuth()

  const resolvedLocale = computed(() => locale.value || 'zh-CN')
  const resolvedTimeZone = computed(() => user.value?.timezone || 'Asia/Shanghai')

  const formatDateTime = (
    value: string | number | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    const formatter = new Intl.DateTimeFormat(resolvedLocale.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: resolvedTimeZone.value,
      ...options
    })
    return formatter.format(date)
  }

  const formatNumber = (
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions
  ) => {
    if (value === null || value === undefined || Number.isNaN(value)) return ''
    const formatter = new Intl.NumberFormat(resolvedLocale.value, options)
    return formatter.format(value)
  }

  return {
    formatDateTime,
    formatNumber,
    locale: resolvedLocale,
    timeZone: resolvedTimeZone
  }
}


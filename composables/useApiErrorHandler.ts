import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'

interface ApiErrorLike {
  statusCode?: number
  message?: string
  data?: {
    code?: string
    message?: string
    details?: any
  }
}

export const useApiErrorHandler = () => {
  const toast = useToast()
  const router = useRouter()
  const { t } = useI18n()

  const handleError = (error: unknown) => {
    const e = error as ApiErrorLike
    const status = e?.statusCode
    const code = e?.data?.code
    const fallbackMessage = e?.data?.message || e?.message || t('demo.components.toast.errorMsg')

    let localized = fallbackMessage
    if (code) {
      const key = `error.codes.${code}`
      const translated = t(key)
      if (translated !== key) {
        localized = translated
      }
    }

    if (code?.startsWith('AUTH_')) {
      toast.error(localized)
      if (
        status === 401 &&
        code !== 'AUTH_INVALID_CREDENTIALS' &&
        code !== 'AUTH_MISSING_CREDENTIALS'
      ) {
        const token = useCookie('auth-token')
        const user = useState('auth-user', () => null)
        token.value = null
        user.value = null
        router.push('/login')
      }
      return
    }

    toast.error(localized)
  }

  return {
    handleError
  }
}

import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'

/**
 * API 错误对象的最小结构定义
 */
interface ApiErrorLike {
  statusCode?: number
  message?: string
  data?: {
    code?: string
    message?: string
    details?: any
  }
}

/**
 * 全局 API 错误处理组合式函数
 * - 根据后端返回的错误码进行本地化提示
 * - 处理鉴权相关错误（清除会话并跳转登录）
 */
export const useApiErrorHandler = () => {
  const toast = useToast()
  const router = useRouter()
  const { t } = useI18n()

  /**
   * 统一处理接口错误
   * @param error 未知错误对象（期望为 ApiErrorLike）
   */
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
        const user = useState('auth-user', () => null)
        user.value = null
        void $fetch('/api/auth/logout', {
          method: 'POST'
        }).catch(() => {})
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

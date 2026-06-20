type FetchOptions<T = any> = {
  method?: string
  query?: any
  body?: any
  headers?: Record<string, any>
  responseType?: string
  onRequest?: (context?: T) => void
  onResponse?: (context: { response: any }) => void
  ignoreErrorStatusCodes?: number[]
}

const LOG_ENDPOINT = '/api/log'

function getRuntimeFetch() {
  const runtimeFetch = (globalThis as any).$fetch
  if (!runtimeFetch) {
    throw new Error('Global $fetch is not available in the current runtime.')
  }
  return runtimeFetch
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function serializeLogValue(value: unknown) {
  if (value == null) {
    return undefined
  }

  if (value instanceof FormData) {
    return '[form-data]'
  }

  if (value instanceof Blob) {
    return `[blob:${value.type || 'application/octet-stream'}]`
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.parse(JSON.stringify(value))
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return String(value)
}

async function reportHttpError(log: Record<string, unknown>) {
  if (log.requestUrl === LOG_ENDPOINT) {
    return
  }

  try {
    await getRuntimeFetch()(LOG_ENDPOINT, {
      method: 'POST',
      body: {
        type: 'HTTP Error',
        ...log
      }
    } as any)
  } catch {
    // Swallow log reporting failures to avoid cascading request errors.
  }
}

/**
 * 基于 `ofetch` 的 HTTP 请求封装类。
 * 提供常用 HTTP 方法与文件上传，并支持拦截器与统一错误处理。
 */
class Http {
  private baseUrl: string

  /**
   * 创建 Http 实例。
   * @param {string} [baseUrl='/api'] - 所有请求的基础路径
   */
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * 核心请求方法：执行实际的 fetch 调用。
   * 负责默认选项、拦截器与错误处理的配置。
   * 
   * @template T
   * @param {string} url - 请求 URL
   * @param {FetchOptions<any>} [options={}] - 请求选项
   * @returns {Promise<T>} 响应数据
   * @private
   */
  private async request<T>(url: string, options: FetchOptions<any> = {}): Promise<T> {
    // 手动拼接基础路径，避免在 Node 环境中使用相对 baseURL 导致 URL 解析错误
    const finalUrl = `${this.baseUrl}${url}`
    const method = String(options.method || 'GET').toUpperCase()
    const startedAt = Date.now()

    const defaultOptions: FetchOptions<any> = {
      onRequest() {},
      onResponse({ response }) {
        if (!response.ok) {
          const data = (response as any)._data
          const err: any = new Error(
            (data && data.message) || response.statusText || `HTTP Error: ${response.status}`
          )
          err.statusCode = response.status
          if (data && typeof data === 'object') {
            err.data = data
            if (data.code) {
              err.code = data.code
            }
          }
          throw err
        }
      }
    }

    // 合并 options
    const newOptions: FetchOptions<any> = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    }

    // 优先使用 Nuxt 运行时提供的全局 $fetch（已与 Nitro 集成，支持相对路径 /api/...）
    // 回退到 ofetch 的 $fetch，便于在测试环境中复用
    const runtimeFetch = getRuntimeFetch()

    try {
      return await runtimeFetch(finalUrl as any, newOptions as any) as any
    } catch (error: any) {
      const response = error?.response
      const statusCode = error?.statusCode ?? response?.status
      const ignoredStatusCodes = newOptions.ignoreErrorStatusCodes || []
      if (statusCode && ignoredStatusCodes.includes(statusCode)) {
        throw error
      }

      const responseData = error?.data ?? response?._data
      const logPayload = {
        method,
        requestUrl: finalUrl,
        statusCode,
        statusMessage: response?.statusText,
        message: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
        requestQuery: serializeLogValue(options.query),
        requestBody: serializeLogValue(options.body),
        responseData: serializeLogValue(responseData),
        timestamp: new Date().toISOString()
      }

      console.error('HTTP Request Error:', logPayload)
      void reportHttpError(logPayload)
      throw error
    }
  }

  /**
   * 发起 GET 请求。
   * 
   * @template T
   * @param {string} url - 请求 URL
   * @param {any} [params] - Query 参数
   * @param {FetchOptions<any>} [options] - 额外请求选项
   * @returns {Promise<T>} 响应数据
   */
  public get<T>(url: string, params?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
      query: params
    })
  }

  /**
   * 发起 POST 请求。
   * 
   * @template T
   * @param {string} url - 请求 URL
   * @param {any} [body] - 请求体
   * @param {FetchOptions<any>} [options] - 额外请求选项
   * @returns {Promise<T>} 响应数据
   */
  public post<T>(url: string, body?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body
    })
  }

  /**
   * 发起 PUT 请求。
   * 
   * @template T
   * @param {string} url - 请求 URL
   * @param {any} [body] - 请求体
   * @param {FetchOptions<any>} [options] - 额外请求选项
   * @returns {Promise<T>} 响应数据
   */
  public put<T>(url: string, body?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body
    })
  }

  /**
   * 发起 DELETE 请求。
   * 
   * @template T
   * @param {string} url - 请求 URL
   * @param {any} [params] - Query 参数
   * @param {FetchOptions<any>} [options] - 额外请求选项
   * @returns {Promise<T>} 响应数据
   */
  public delete<T>(url: string, params?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
      query: params
    })
  }

  /**
   * 通过 POST 上传文件（multipart/form-data）。
   * 
   * @template T
   * @param {string} url - 上传目标 URL
   * @param {File | Blob} file - 要上传的文件
   * @param {string} [fieldName='file'] - 文件字段名
   * @param {Record<string, any>} [otherParams={}] - 额外表单字段
   * @returns {Promise<T>} 响应数据
   */
  public upload<T>(url: string, file: File | Blob, fieldName: string = 'file', otherParams: Record<string, any> = {}): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)
    
    // 附加其他表单字段
    Object.keys(otherParams).forEach(key => {
      formData.append(key, otherParams[key])
    })

    return this.request<T>(url, {
      method: 'POST',
      body: formData
      // $fetch 会自动设置 Content-Type 为 multipart/form-data
    })
  }

  // 下载文件
  public async download(url: string, fileName?: string, params?: any): Promise<void> {
    try {
      const blob = await this.request<Blob>(url, {
        method: 'GET',
        query: params,
        responseType: 'blob'
      })

      // 创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      
      // 如果没有提供文件名，尝试从 URL 或响应头中获取（这里简单实现）
      if (!fileName) {
        fileName = url.split('/').pop() || 'download'
      }
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      
      // 清理
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }
}

// 导出单例
export const http = new Http()

import { $fetch as ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

/**
 * 标准 API 响应结构接口。
 * @template T - data 的类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
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
      },
      onResponseError({ response }) {
        console.error('Response Error:', response.statusText)
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
    const runtimeFetch = (globalThis as any).$fetch || ofetch

    return runtimeFetch(finalUrl as any, newOptions as any) as any
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

import { $fetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

/**
 * Interface representing the standard API response structure.
 * @template T - The type of the data payload.
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * A wrapper class for HTTP requests based on `ofetch`.
 * Provides methods for common HTTP verbs and file uploads with interceptors.
 */
class Http {
  private baseUrl: string

  /**
   * Creates an instance of Http.
   * @param {string} [baseUrl='/api'] - The base URL for all requests.
   */
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Core request method that handles the actual fetch call.
   * Configures default options, interceptors, and error handling.
   * 
   * @template T
   * @param {string} url - The URL to request.
   * @param {FetchOptions<any>} [options={}] - Request options.
   * @returns {Promise<T>} The response data.
   * @private
   */
  private async request<T>(url: string, options: FetchOptions<any> = {}): Promise<T> {
    const defaultOptions: FetchOptions<any> = {
      baseURL: this.baseUrl,
      // Request interceptor
      onRequest() {
        // Add global token here if needed
        // const token = useCookie('token').value
        // if (token) {
        //   options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
        // }
      },
      // Response interceptor
      onResponse({ response }) {
        if (!response.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP Error: ${response.status}`)
        }
        // Handle backend specific error codes here if needed
        // if (response._data.code !== 200) { ... }
      },
      onResponseError({ response }) {
        // Handle response errors
        console.error('Response Error:', response.statusText)
      }
    }

    // Merge options
    const newOptions: FetchOptions<any> = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    }

    return $fetch(url as any, newOptions as any) as any
  }

  /**
   * Performs a GET request.
   * 
   * @template T
   * @param {string} url - The URL to request.
   * @param {any} [params] - Query parameters.
   * @param {FetchOptions<any>} [options] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  public get<T>(url: string, params?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
      query: params
    })
  }

  /**
   * Performs a POST request.
   * 
   * @template T
   * @param {string} url - The URL to request.
   * @param {any} [body] - The request body.
   * @param {FetchOptions<any>} [options] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  public post<T>(url: string, body?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body
    })
  }

  /**
   * Performs a PUT request.
   * 
   * @template T
   * @param {string} url - The URL to request.
   * @param {any} [body] - The request body.
   * @param {FetchOptions<any>} [options] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  public put<T>(url: string, body?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body
    })
  }

  /**
   * Performs a DELETE request.
   * 
   * @template T
   * @param {string} url - The URL to request.
   * @param {any} [params] - Query parameters.
   * @param {FetchOptions<any>} [options] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  public delete<T>(url: string, params?: any, options?: FetchOptions<any>): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
      query: params
    })
  }

  /**
   * Uploads a file via POST request (Multipart Form Data).
   * 
   * @template T
   * @param {string} url - The URL to upload to.
   * @param {File | Blob} file - The file to upload.
   * @param {string} [fieldName='file'] - The form field name for the file.
   * @param {Record<string, any>} [otherParams={}] - Additional form data parameters.
   * @returns {Promise<T>} The response data.
   */
  public upload<T>(url: string, file: File | Blob, fieldName: string = 'file', otherParams: Record<string, any> = {}): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)
    
    // Add other parameters
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

// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 统一 mock ofetch 的 $fetch
const $fetchMock = vi.fn()

describe('utils/http', () => {
  let http: any

  beforeEach(async () => {
    vi.resetModules()
    $fetchMock.mockReset()
    ;(globalThis as any).$fetch = $fetchMock

    const { http: httpInstance } = await import('~/utils/http')
    http = httpInstance
  })

  it('get 方法会通过 $fetch 发起 GET 请求并携带 query 参数', async () => {
    $fetchMock.mockResolvedValue({ ok: true })

    const result = await http.get('/test', { foo: 'bar' })

    expect($fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = $fetchMock.mock.calls[0]

    expect(url).toBe('/api/test')
    expect(options.method).toBe('GET')
    expect(options.query).toEqual({ foo: 'bar' })
    expect(result).toEqual({ ok: true })
  })

  it('post 方法会通过 $fetch 发起 POST 请求并携带 body', async () => {
    $fetchMock.mockResolvedValue({ created: true })

    const payload = { name: 'test' }
    const result = await http.post('/items', payload)

    const [url, options] = $fetchMock.mock.calls[0]

    expect(url).toBe('/api/items')
    expect(options.method).toBe('POST')
    expect(options.body).toEqual(payload)
    expect(result).toEqual({ created: true })
  })

  it('delete 方法会通过 $fetch 发起 DELETE 请求并携带 query 参数', async () => {
    $fetchMock.mockResolvedValue({ deleted: true })

    await http.delete('/items/1', { force: true })

    const [url, options] = $fetchMock.mock.calls[0]

    expect(url).toBe('/api/items/1')
    expect(options.method).toBe('DELETE')
    expect(options.query).toEqual({ force: true })
  })

  it('upload 会构造 FormData 并使用 POST 方式提交', async () => {
    $fetchMock.mockResolvedValue({ success: true })

    const file = new Blob(['hello'], { type: 'text/plain' })
    await http.upload('/upload', file, 'myfile', { extra: '1' })

    const [, options] = $fetchMock.mock.calls[0]

    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)

    const body = options.body as FormData
    const fileField = body.get('myfile')
    // 在不同环境下，FormData 可能返回 File 或 Blob，这里只验证其类型与内容相关属性
    expect(fileField).toBeInstanceOf(Blob)
    expect((fileField as Blob).size).toBe(file.size)
    expect((fileField as Blob).type).toBe(file.type)
    expect(body.get('extra')).toBe('1')
  })

  it('download 会调用 $fetch 并通过浏览器 API 触发下载', async () => {
    const blob = new Blob(['data'], { type: 'text/plain' })
    $fetchMock.mockResolvedValue(blob)

    // 在 jsdom 环境下，URL 或其方法可能不存在，这里先提供一个简单实现再进行 spy
    if (!window.URL) {
      // @ts-ignore
      window.URL = {} as any
    }
    if (!window.URL.createObjectURL) {
      // @ts-ignore
      window.URL.createObjectURL = () => ''
    }
    if (!window.URL.revokeObjectURL) {
      // @ts-ignore
      window.URL.revokeObjectURL = () => {}
    }

    const createObjectURLSpy = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url')
    const revokeObjectURLSpy = vi
      .spyOn(window.URL, 'revokeObjectURL')
      .mockImplementation(() => {})

    const clickMock = vi.fn()
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((el: any) => {
        // 给 a 元素注入 click 方法
        el.click = clickMock
        return el
      })

    await http.download('/files/report.txt', 'report.txt')

    expect($fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = $fetchMock.mock.calls[0]
    expect(url).toBe('/api/files/report.txt')
    expect(options.responseType).toBe('blob')

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
    expect(appendChildSpy).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')

    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
    appendChildSpy.mockRestore()
  })

  it('请求失败时会向 /api/log 上报 HTTP 错误日志', async () => {
    const fetchError: any = new Error('Request failed with status code 500')
    fetchError.response = {
      status: 500,
      statusText: 'Internal Server Error',
      _data: { message: 'server exploded' }
    }

    $fetchMock
      .mockRejectedValueOnce(fetchError)
      .mockResolvedValueOnce({ success: true })

    await expect(http.get('/broken', { id: 1 })).rejects.toThrow('Request failed with status code 500')

    expect($fetchMock).toHaveBeenCalledTimes(2)

    const [requestUrl, requestOptions] = $fetchMock.mock.calls[0]
    expect(requestUrl).toBe('/api/broken')
    expect(requestOptions.method).toBe('GET')

    const [logUrl, logOptions] = $fetchMock.mock.calls[1]
    expect(logUrl).toBe('/api/log')
    expect(logOptions.method).toBe('POST')
    expect(logOptions.body.type).toBe('HTTP Error')
    expect(logOptions.body.method).toBe('GET')
    expect(logOptions.body.requestUrl).toBe('/api/broken')
    expect(logOptions.body.statusCode).toBe(500)
    expect(logOptions.body.responseData).toEqual({ message: 'server exploded' })
  })

  it('日志接口自身失败时不会递归上报', async () => {
    const fetchError = new Error('log endpoint failed')
    $fetchMock.mockRejectedValueOnce(fetchError)

    await expect(http.post('/log', { type: 'test' })).rejects.toThrow('log endpoint failed')

    expect($fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = $fetchMock.mock.calls[0]
    expect(url).toBe('/api/log')
    expect(options.method).toBe('POST')
  })

  it('可忽略指定状态码的错误日志输出与上报', async () => {
    const fetchError: any = new Error('Unauthorized')
    fetchError.statusCode = 401
    fetchError.response = {
      status: 401,
      statusText: 'Unauthorized'
    }

    $fetchMock.mockRejectedValueOnce(fetchError)

    await expect(http.get('/orders', undefined, {
      ignoreErrorStatusCodes: [401]
    })).rejects.toThrow('Unauthorized')

    expect($fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = $fetchMock.mock.calls[0]
    expect(url).toBe('/api/orders')
    expect(options.ignoreErrorStatusCodes).toEqual([401])
  })
})

export default defineEventHandler((event) => {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, HEAD, PUT, PATCH, POST, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }

  // 若存在 Origin，则回写以支持携带凭证的跨域请求
  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  } else {
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
  }

  setResponseHeaders(event, headers)

  // 处理预检请求（Preflight）
  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return 'OK'
  }
})

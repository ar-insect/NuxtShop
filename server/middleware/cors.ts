export default defineEventHandler((event) => {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, HEAD, PUT, PATCH, POST, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }

  // Reflect the origin if present to support credentials
  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  } else {
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
  }

  setResponseHeaders(event, headers)

  // Handle preflight requests
  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return 'OK'
  }
})

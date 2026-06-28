import { getRequestHeader, send, setResponseHeaders, setResponseStatus } from 'h3'
// @ts-expect-error Nitro provides this internal runtime export for custom error handlers.
import { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils'
import { writeServerLog } from '~/server/utils/server-log'

const DEFAULT_JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'content-security-policy': "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
}

const getStackPreview = (error: Error | undefined) => {
  if (!error?.stack) {
    return null
  }

  return error.stack
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 12)
}

export default defineNitroErrorHandler(async (error: any, event: any) => {
  const statusCode = error.statusCode || 500
  const statusMessage = error.statusMessage || 'Internal Server Error'
  const errorData = error.data as Record<string, unknown> | undefined
  const message = typeof errorData?.message === 'string'
    ? errorData.message
    : error.message || statusMessage
  const acceptsHtml = getRequestHeader(event, 'accept')?.includes('text/html')
  const errorCode = typeof errorData?.code === 'string' ? errorData.code : null
  const stackPreview = getStackPreview(error instanceof Error ? error : undefined)

  await writeServerLog(event, {
    type: 'Nitro Error',
    level: statusCode >= 500 ? 'error' : 'warn',
    action: 'request_error',
    message,
    details: {
      statusCode,
      statusMessage,
      errorCode,
      errorMessage: error?.message || null,
      acceptsHtml: Boolean(acceptsHtml),
      isApiRequest: Boolean(event.path?.startsWith('/api/')),
      isUnhandled: Boolean(error?.unhandled),
      isFatal: Boolean(error?.fatal),
      data: errorData || null,
      stack: stackPreview
    }
  })

  if (!event.path?.startsWith('/api/') && acceptsHtml) {
    setResponseHeaders(event, {
      'content-type': 'text/html; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
      'content-security-policy': "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
    })
    setResponseStatus(event, statusCode, statusMessage)

    return send(event, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${statusCode} ${statusMessage}</title></head><body><h1>${statusCode} ${statusMessage}</h1><p>${message}</p></body></html>`, 'text/html')
  }

  setResponseHeaders(event, {
    ...DEFAULT_JSON_HEADERS,
    'cache-control': 'no-cache'
  })
  setResponseStatus(event, statusCode, statusMessage)

  return send(event, JSON.stringify({
    error: true,
    url: event.path,
    statusCode,
    statusMessage,
    message,
    data: errorData
  }), 'application/json')
})

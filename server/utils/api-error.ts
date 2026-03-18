export interface ApiErrorPayload {
  code: string
  message: string
  details?: any
}

interface CreateApiErrorOptions extends ApiErrorPayload {
  statusCode: number
}

export const createApiError = (options: CreateApiErrorOptions) => {
  const { statusCode, code, message, details } = options

  return createError({
    statusCode,
    statusMessage: message,
    data: {
      code,
      message,
      details
    }
  })
}


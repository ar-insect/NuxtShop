export interface SelectOption<T = string | number> {
  label: string
  value: T
  [key: string]: any
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface SearchQuery {
  keyword?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    list: T[]
    total: number
    page: number
    limit: number
  }
}

export interface ApiError {
  code: number
  message: string
  errors?: Array<{ field: string; message: string }>
}

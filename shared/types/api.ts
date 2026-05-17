export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  limit: number
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<PaginatedData<T>> {}

export interface ApiError {
  code: number
  message: string
  errors?: Array<{ field: string; message: string }>
}

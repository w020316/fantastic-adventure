import type { Category } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getCategories() {
  return request.get<unknown, ApiResponse<Category[]>>('/categories')
}

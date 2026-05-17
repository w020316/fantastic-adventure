import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getCategories() {
  return request.get<unknown, ApiResponse<Category[]>>('/categories')
}

export function createCategory(data: CreateCategoryRequest) {
  return request.post<unknown, ApiResponse<Category>>('/categories', data)
}

export function updateCategory(id: number, data: UpdateCategoryRequest) {
  return request.put<unknown, ApiResponse<Category>>(`/categories/${id}`, data)
}

export function deleteCategory(id: number) {
  return request.delete<unknown, ApiResponse<null>>(`/categories/${id}`)
}

import type { Tag, CreateTagRequest, UpdateTagRequest } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getTags() {
  return request.get<unknown, ApiResponse<Tag[]>>('/tags')
}

export function createTag(data: CreateTagRequest) {
  return request.post<unknown, ApiResponse<Tag>>('/tags', data)
}

export function updateTag(id: number, data: UpdateTagRequest) {
  return request.put<unknown, ApiResponse<Tag>>(`/tags/${id}`, data)
}

export function deleteTag(id: number) {
  return request.delete<unknown, ApiResponse<null>>(`/tags/${id}`)
}

import type { Comment, UpdateCommentStatusRequest } from 'shared'
import type { ApiResponse, PaginatedResponse } from 'shared'
import request from '../utils/request'

export function getComments(params?: { page?: number; limit?: number; status?: Comment['status'] }) {
  return request.get<unknown, PaginatedResponse<Comment>>('/comments', { params })
}

export function updateCommentStatus(id: number, data: UpdateCommentStatusRequest) {
  return request.put<unknown, ApiResponse<Comment>>(`/comments/${id}/status`, data)
}

export function deleteComment(id: number) {
  return request.delete<unknown, ApiResponse<null>>(`/comments/${id}`)
}

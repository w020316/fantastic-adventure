import type { Comment, CreateCommentRequest } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getComments(articleId: number) {
  return request.get<unknown, ApiResponse<Comment[]>>(`/articles/${articleId}/comments`)
}

export function createComment(articleId: number, data: CreateCommentRequest) {
  return request.post<unknown, ApiResponse<Comment>>(`/articles/${articleId}/comments`, data)
}

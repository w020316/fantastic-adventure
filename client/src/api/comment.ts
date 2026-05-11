import request from '../utils/request'

export function getComments(articleId: number) {
  return request.get(`/articles/${articleId}/comments`)
}

export function createComment(articleId: number, data: { nickname: string; email?: string; content: string; parent_id?: number }) {
  return request.post(`/articles/${articleId}/comments`, data)
}

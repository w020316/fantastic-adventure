import request from '../utils/request'

export function getComments(params?: any) {
  return request.get('/comments', { params })
}

export function updateCommentStatus(id: number, status: string) {
  return request.put(`/comments/${id}/status`, { status })
}

export function deleteComment(id: number) {
  return request.delete(`/comments/${id}`)
}

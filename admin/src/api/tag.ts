import request from '../utils/request'

export function getTags() {
  return request.get('/tags')
}

export function createTag(data: { name: string; color?: string }) {
  return request.post('/tags', data)
}

export function updateTag(id: number, data: { name?: string; color?: string }) {
  return request.put(`/tags/${id}`, data)
}

export function deleteTag(id: number) {
  return request.delete(`/tags/${id}`)
}

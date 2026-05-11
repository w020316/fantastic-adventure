import request from '../utils/request'

export function getArticles(params?: any) {
  return request.get('/articles', { params })
}

export function getArticle(id: number) {
  return request.get(`/articles/${id}`)
}

export function createArticle(data: any) {
  return request.post('/articles', data)
}

export function updateArticle(id: number, data: any) {
  return request.put(`/articles/${id}`, data)
}

export function deleteArticle(id: number) {
  return request.delete(`/articles/${id}`)
}

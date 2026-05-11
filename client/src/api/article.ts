import request from '../utils/request'

export function getArticles(params?: any) {
  return request.get('/articles', { params })
}

export function getArticle(id: number) {
  return request.get(`/articles/${id}`)
}

export function likeArticle(id: number) {
  return request.post(`/articles/${id}/like`)
}

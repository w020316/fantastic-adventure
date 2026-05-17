import type { Article, ArticleListQuery, ArticleDetail } from 'shared'
import type { ApiResponse, PaginatedResponse } from 'shared'
import request from '../utils/request'

export function getArticles(params?: ArticleListQuery) {
  return request.get<unknown, PaginatedResponse<Article>>('/articles', { params })
}

export function getArticle(id: number) {
  return request.get<unknown, ApiResponse<ArticleDetail>>(`/articles/${id}`)
}

export function getRelatedArticles(id: number, limit: number = 3) {
  return request.get<unknown, ApiResponse<Article[]>>(`/articles/${id}/related`, { params: { limit } })
}

export function likeArticle(id: number) {
  return request.post<unknown, ApiResponse<{ liked: boolean }>>(`/articles/${id}/like`)
}

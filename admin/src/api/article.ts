import type { Article, ArticleListQuery, ArticleDetail, CreateArticleRequest, UpdateArticleRequest } from 'shared'
import type { ApiResponse, PaginatedResponse } from 'shared'
import request from '../utils/request'

export function getArticles(params?: ArticleListQuery) {
  return request.get<unknown, PaginatedResponse<Article>>('/articles', { params })
}

export function getArticle(id: number) {
  return request.get<unknown, ApiResponse<ArticleDetail>>(`/articles/${id}`)
}

export function createArticle(data: CreateArticleRequest) {
  return request.post<unknown, ApiResponse<Article>>('/articles', data)
}

export function updateArticle(id: number, data: UpdateArticleRequest) {
  return request.put<unknown, ApiResponse<Article>>(`/articles/${id}`, data)
}

export function deleteArticle(id: number) {
  return request.delete<unknown, ApiResponse<null>>(`/articles/${id}`)
}

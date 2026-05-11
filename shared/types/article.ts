import type { Category } from './category'
import type { Tag } from './tag'

export interface Article {
  id: number
  title: string
  content: string
  summary: string | null
  cover_image: string | null
  category_id: number
  author_id: number
  status: 'draft' | 'published'
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface ArticleListQuery {
  page?: number
  limit?: number
  category_id?: number
  tag_id?: number
  keyword?: string
  status?: 'draft' | 'published'
}

export interface CreateArticleRequest {
  title: string
  content: string
  summary?: string
  cover_image?: string
  category_id: number
  tag_ids?: number[]
  status?: 'draft' | 'published'
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
  summary?: string
  cover_image?: string
  category_id?: number
  tag_ids?: number[]
  status?: 'draft' | 'published'
}

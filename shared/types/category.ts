export interface Category {
  id: number
  name: string
  sort_order: number
  created_at: string
  article_count?: number
}

export interface CreateCategoryRequest {
  name: string
  sort_order?: number
}

export interface UpdateCategoryRequest {
  name?: string
  sort_order?: number
}

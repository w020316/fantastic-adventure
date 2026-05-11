export interface Project {
  id: number
  title: string
  description: string | null
  tech_stack: string[] | null
  cover_image: string | null
  demo_url: string | null
  repo_url: string | null
  sort_order: number
  author_id: number
  created_at: string
  updated_at: string
}

export interface CreateProjectRequest {
  title: string
  description?: string
  tech_stack?: string[]
  cover_image?: string
  demo_url?: string
  repo_url?: string
  sort_order?: number
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  tech_stack?: string[]
  cover_image?: string
  demo_url?: string
  repo_url?: string
  sort_order?: number
}

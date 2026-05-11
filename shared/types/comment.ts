export interface Comment {
  id: number
  article_id: number
  nickname: string
  email: string | null
  content: string
  parent_id: number | null
  status: 'pending' | 'approved' | 'hidden'
  created_at: string
  replies?: Comment[]
}

export interface CreateCommentRequest {
  nickname: string
  email?: string
  content: string
  parent_id?: number
}

export interface UpdateCommentStatusRequest {
  status: 'pending' | 'approved' | 'hidden'
}

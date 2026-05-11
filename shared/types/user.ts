export interface User {
  id: number
  username: string
  email: string | null
  avatar: string | null
  role: 'admin' | 'visitor'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

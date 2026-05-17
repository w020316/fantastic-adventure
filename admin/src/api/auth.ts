import type { LoginRequest, LoginResponse, User } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function login(data: LoginRequest) {
  return request.post<unknown, ApiResponse<LoginResponse>>('/auth/login', data)
}

export function getProfile() {
  return request.get<unknown, ApiResponse<User>>('/auth/profile')
}

export function refreshToken(refresh_token: string) {
  return request.post<unknown, ApiResponse<LoginResponse>>('/auth/refresh', { refresh_token })
}

export function updatePassword(data: { old_password: string; new_password: string }) {
  return request.put<unknown, ApiResponse<null>>('/auth/password', data)
}

export function updateAvatar(data: { avatar: string }) {
  return request.put<unknown, ApiResponse<User>>('/auth/avatar', data)
}

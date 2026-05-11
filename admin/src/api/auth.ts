import request from '../utils/request'

export function login(data: { username: string; password: string }) {
  return request.post('/auth/login', data)
}

export function getProfile() {
  return request.get('/auth/profile')
}

export function refreshToken(refresh_token: string) {
  return request.post('/auth/refresh', { refresh_token })
}

export function updatePassword(data: { old_password: string; new_password: string }) {
  return request.put('/auth/password', data)
}

export function updateAvatar(data: { avatar: string }) {
  return request.put('/auth/avatar', data)
}

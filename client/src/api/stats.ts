import request from '../utils/request'

export function recordVisit(data: { path: string; referrer?: string }) {
  return request.post('/stats', data)
}

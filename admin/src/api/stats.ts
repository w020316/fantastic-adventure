import request from '../utils/request'

export function getOverview() {
  return request.get('/stats/overview')
}

export function getTrend(days?: number) {
  return request.get('/stats/trend', { params: { days } })
}

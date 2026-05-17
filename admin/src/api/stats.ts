import type { StatsOverview, StatsTrend } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getOverview() {
  return request.get<unknown, ApiResponse<StatsOverview>>('/stats/overview')
}

export function getTrend(days?: number) {
  return request.get<unknown, ApiResponse<StatsTrend>>('/stats/trend', { params: { days } })
}

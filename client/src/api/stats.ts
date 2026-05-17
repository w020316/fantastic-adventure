import type { StatsRecord } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function recordVisit(data: Pick<StatsRecord, 'path'>) {
  return request.post<unknown, ApiResponse<unknown>>('/stats', data)
}

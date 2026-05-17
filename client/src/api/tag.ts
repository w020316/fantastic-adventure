import type { Tag } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getTags() {
  return request.get<unknown, ApiResponse<Tag[]>>('/tags')
}

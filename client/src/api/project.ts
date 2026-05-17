import type { Project } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getProjects() {
  return request.get<unknown, ApiResponse<Project[]>>('/projects')
}

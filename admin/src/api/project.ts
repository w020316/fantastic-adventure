import type { Project, CreateProjectRequest, UpdateProjectRequest } from 'shared'
import type { ApiResponse } from 'shared'
import request from '../utils/request'

export function getProjects() {
  return request.get<unknown, ApiResponse<Project[]>>('/projects')
}

export function createProject(data: CreateProjectRequest) {
  return request.post<unknown, ApiResponse<Project>>('/projects', data)
}

export function updateProject(id: number, data: UpdateProjectRequest) {
  return request.put<unknown, ApiResponse<Project>>(`/projects/${id}`, data)
}

export function deleteProject(id: number) {
  return request.delete<unknown, ApiResponse<null>>(`/projects/${id}`)
}

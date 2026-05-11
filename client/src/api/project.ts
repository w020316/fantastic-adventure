import request from '../utils/request'

export function getProjects() {
  return request.get('/projects')
}

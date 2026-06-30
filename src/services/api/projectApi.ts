// ─── Project API Service ───────────────────────────────────────────────────

import { apiClient } from './client'
import type { IProject, IProjectSummary } from '../../types/project.types'
import type { IApiResponse, IPaginatedResponse } from '../../types/api.types'

export const projectApi = {
  list(): Promise<IApiResponse<IPaginatedResponse<IProjectSummary>>> {
    return apiClient.get('/api/projects')
  },

  get(id: string): Promise<IApiResponse<IProject>> {
    return apiClient.get(`/api/projects/${id}`)
  },

  create(data: Partial<IProject>): Promise<IApiResponse<IProject>> {
    return apiClient.post('/api/projects', data)
  },

  update(id: string, data: Partial<IProject>): Promise<IApiResponse<IProject>> {
    return apiClient.put(`/api/projects/${id}`, data)
  },

  delete(id: string): Promise<IApiResponse<void>> {
    return apiClient.delete(`/api/projects/${id}`)
  },

  saveScene(projectId: string, floorId: string, elements: unknown[]): Promise<IApiResponse<void>> {
    return apiClient.post(`/api/projects/${projectId}/floors/${floorId}/scene`, { elements })
  },

  loadScene(projectId: string, floorId: string): Promise<IApiResponse<{ elements: unknown[] }>> {
    return apiClient.get(`/api/projects/${projectId}/floors/${floorId}/scene`)
  },
}

export const authApi = {
  login(email: string, password: string) {
    return apiClient.post<{ accessToken: string; refreshToken: string }>('/api/auth/login', { email, password })
  },
  register(name: string, email: string, password: string) {
    return apiClient.post<{ accessToken: string }>('/api/auth/register', { name, email, password })
  },
  refresh(refreshToken: string) {
    return apiClient.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken })
  },
  logout() {
    return apiClient.post<void>('/api/auth/logout', {})
  },
}

// ─── API Service ───────────────────────────────────────────────────────────
// Thin wrapper around fetch for REST API calls.

import type { IApiResponse, IPaginatedResponse } from '../../types/api.types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null): void {
    this.token = token
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  async get<T>(path: string): Promise<IApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() })
    return res.json()
  }

  async post<T>(path: string, body: unknown): Promise<IApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async put<T>(path: string, body: unknown): Promise<IApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async delete<T>(path: string): Promise<IApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    })
    return res.json()
  }
}

export const apiClient = new ApiClient(BASE_URL)

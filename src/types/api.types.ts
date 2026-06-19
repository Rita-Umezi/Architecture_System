// ─── API Types ─────────────────────────────────────────────────────────────

export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface IPaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface IUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  createdAt: string
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface IPresenceUser {
  userId: string
  name: string
  avatar?: string
  color: string             // assigned presence color
  cursorX?: number
  cursorY?: number
  activeFloorId?: string
  lastSeen: string
}

// ─── Local Storage Service ─────────────────────────────────────────────────
// Handles auto-save, project drafts, and user preferences.

const PREFIX = 'buildflow:'

export const localStore = {
  set<T>(key: string, value: T): void {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* quota */ }
  },
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch { return fallback }
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  // Auto-save helpers
  saveProjectDraft(projectId: string, data: unknown): void {
    this.set(`draft:${projectId}`, { data, savedAt: new Date().toISOString() })
  },
  loadProjectDraft(projectId: string): { data: unknown; savedAt: string } | null {
    return this.get(`draft:${projectId}`, null as any)
  },
  clearProjectDraft(projectId: string): void {
    this.remove(`draft:${projectId}`)
  },

  // User preferences
  savePreferences(prefs: Record<string, unknown>): void {
    this.set('preferences', prefs)
  },
  loadPreferences(): Record<string, unknown> {
    return this.get('preferences', {})
  },

  // Auth token
  saveToken(token: string): void { this.set('token', token) },
  loadToken(): string | null { return this.get('token', null as any) },
  clearToken(): void { this.remove('token') },
}

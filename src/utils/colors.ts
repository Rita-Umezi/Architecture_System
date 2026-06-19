// ─── Color Utilities ───────────────────────────────────────────────────────

/** Preset presence colors for collaborative users */
export const PRESENCE_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#f43f5e', '#8b5cf6', '#84cc16',
]

/** Get a deterministic color from a user ID */
export function getUserColor(userId: string): string {
  let hash = 0
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PRESENCE_COLORS[hash % PRESENCE_COLORS.length]
}

/** Convert hex to rgba string */
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Lighten a hex color by a percentage */
export function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount))
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount))
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// Room program type colors (for 2D fills)
export const ROOM_COLORS: Record<string, string> = {
  bedroom:    '#dbeafe',
  bathroom:   '#d1fae5',
  kitchen:    '#fef3c7',
  living:     '#ede9fe',
  dining:     '#fce7f3',
  office:     '#e0f2fe',
  corridor:   '#f1f5f9',
  storage:    '#f3f4f6',
  garage:     '#e5e7eb',
  default:    '#f8fafc',
}

export function getRoomColor(programType: string): string {
  return ROOM_COLORS[programType] ?? ROOM_COLORS.default
}

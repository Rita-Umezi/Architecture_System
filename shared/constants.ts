// ─── Shared Constants ──────────────────────────────────────────────────────
// Used by both client and server.

export const SCHEMA_VERSION = 1
export const MAX_UNDO_DEPTH  = 100
export const MAX_FLOORS      = 50
export const MAX_WALLS_PER_FLOOR = 10_000
export const DEFAULT_FLOOR_HEIGHT = 3000  // mm
export const DEFAULT_WALL_HEIGHT  = 2700  // mm
export const DEFAULT_WALL_THICKNESS = 200 // mm
export const SNAP_RADIUS_PX = 20
export const GRID_SIZE_MM   = 100
export const MIN_WALL_LENGTH = 10  // mm

export const PRESENCE_COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981',
  '#06b6d4','#f43f5e','#8b5cf6','#84cc16',
]

export const PROGRAM_TYPES = [
  'bedroom','bathroom','kitchen','living','dining',
  'office','corridor','storage','garage','balcony',
  'utility','lobby','conference','server-room',
] as const

export type ProgramType = typeof PROGRAM_TYPES[number]

export const WEBSOCKET_EVENTS = {
  JOIN_PROJECT:    'project:join',
  LEAVE_PROJECT:   'project:leave',
  COMMAND:         'scene:command',
  CURSOR_MOVE:     'cursor:move',
  PRESENCE_UPDATE: 'presence:update',
  CONFLICT:        'scene:conflict',
  ERROR:           'error',
} as const

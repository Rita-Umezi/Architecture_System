// ─── Snap Types ────────────────────────────────────────────────────────────

import type { IPoint } from './geometry.types'

export type SnapType =
  | 'grid'
  | 'wall-endpoint'
  | 'wall-midpoint'
  | 'angle'
  | 'guide'
  | 'intersection'
  | 'none'

export interface ISnapCandidate {
  point: IPoint
  snapType: SnapType
  priority: number          // higher = preferred
  sourceId?: string         // wall ID, guide ID, etc.
}

export interface ISnapResult {
  point: IPoint
  snapType: SnapType
  snapped: boolean
  sourceId?: string
}

export interface ISnapSettings {
  gridEnabled: boolean
  wallEndpointEnabled: boolean
  wallMidpointEnabled: boolean
  angleEnabled: boolean
  guideEnabled: boolean
  intersectionEnabled: boolean
  gridSize: number          // mm
  snapRadius: number        // pixels
  angleIncrement: number    // degrees (default 45)
}

export interface IGuide {
  id: string
  type: 'horizontal' | 'vertical' | 'angle'
  value: number             // y position, x position, or angle in degrees
}

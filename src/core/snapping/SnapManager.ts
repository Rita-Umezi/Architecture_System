// ─── Snap System ───────────────────────────────────────────────────────────
// All snap logic is pure math — zero rendering dependencies.

import type { IPoint } from '../../types/geometry.types'
import type { IWallElement } from '../../types/element.types'
import type { ISnapCandidate, ISnapResult, ISnapSettings, IGuide } from '../../types/snap.types'
import { snapToGrid, snapAngle, distance, midpoint } from '../../utils/math'
import { Segment } from '../geometry/primitives/Segment'
import { Point } from '../geometry/primitives/Point'

const PIXEL_TO_MM_RATIO = 1  // adjust if canvas uses scaled coordinates

// ─── Individual Snap Strategies ───────────────────────────────────────────

export function gridSnap(raw: IPoint, gridSizeMM: number): ISnapCandidate {
  return {
    point: { x: snapToGrid(raw.x, gridSizeMM), y: snapToGrid(raw.y, gridSizeMM) },
    snapType: 'grid',
    priority: 1,
  }
}

export function wallEndpointSnap(
  raw: IPoint, walls: IWallElement[], radiusMM: number
): ISnapCandidate | null {
  let best: ISnapCandidate | null = null
  let bestDist = radiusMM

  for (const wall of walls) {
    for (const pt of [wall.startPoint, wall.endPoint]) {
      const d = distance(raw, pt)
      if (d < bestDist) {
        bestDist = d
        best = { point: pt, snapType: 'wall-endpoint', priority: 10, sourceId: wall.id }
      }
    }
  }
  return best
}

export function wallMidpointSnap(
  raw: IPoint, walls: IWallElement[], radiusMM: number
): ISnapCandidate | null {
  let best: ISnapCandidate | null = null
  let bestDist = radiusMM

  for (const wall of walls) {
    const mid = midpoint(wall.startPoint, wall.endPoint)
    const d = distance(raw, mid)
    if (d < bestDist) {
      bestDist = d
      best = { point: mid, snapType: 'wall-midpoint', priority: 8, sourceId: wall.id }
    }
  }
  return best
}

export function angleSnap(
  raw: IPoint, origin: IPoint, incrementDeg: number
): ISnapCandidate {
  const dx = raw.x - origin.x
  const dy = raw.y - origin.y
  const len = Math.sqrt(dx*dx + dy*dy)
  const currentAngle = Math.atan2(dy, dx)
  const snappedAngle = snapAngle(currentAngle, incrementDeg)
  return {
    point: {
      x: origin.x + Math.cos(snappedAngle) * len,
      y: origin.y + Math.sin(snappedAngle) * len,
    },
    snapType: 'angle',
    priority: 6,
  }
}

export function guideSnap(
  raw: IPoint, guides: IGuide[], radiusMM: number
): ISnapCandidate | null {
  let best: ISnapCandidate | null = null
  let bestDist = radiusMM

  for (const guide of guides) {
    let d: number
    let snappedPt: IPoint

    if (guide.type === 'horizontal') {
      d = Math.abs(raw.y - guide.value)
      snappedPt = { x: raw.x, y: guide.value }
    } else if (guide.type === 'vertical') {
      d = Math.abs(raw.x - guide.value)
      snappedPt = { x: guide.value, y: raw.y }
    } else continue

    if (d < bestDist) {
      bestDist = d
      best = { point: snappedPt, snapType: 'guide', priority: 7, sourceId: guide.id }
    }
  }
  return best
}

// ─── Snap Manager ─────────────────────────────────────────────────────────

export class SnapManager {
  resolve(
    raw: IPoint,
    walls: IWallElement[],
    settings: ISnapSettings,
    guides: IGuide[] = [],
    drawOrigin?: IPoint,
  ): ISnapResult {
    const candidates: ISnapCandidate[] = []

    if (settings.wallEndpointEnabled) {
      const c = wallEndpointSnap(raw, walls, settings.snapRadius)
      if (c) candidates.push(c)
    }

    if (settings.wallMidpointEnabled) {
      const c = wallMidpointSnap(raw, walls, settings.snapRadius)
      if (c) candidates.push(c)
    }

    if (settings.guideEnabled && guides.length > 0) {
      const c = guideSnap(raw, guides, settings.snapRadius)
      if (c) candidates.push(c)
    }

    if (settings.angleEnabled && drawOrigin) {
      candidates.push(angleSnap(raw, drawOrigin, settings.angleIncrement))
    }

    if (candidates.length > 0) {
      // Pick highest priority candidate
      const best = candidates.reduce((a, b) => a.priority >= b.priority ? a : b)
      return { point: best.point, snapType: best.snapType, snapped: true, sourceId: best.sourceId }
    }

    if (settings.gridEnabled) {
      const grid = gridSnap(raw, settings.gridSize)
      return { point: grid.point, snapType: 'grid', snapped: true }
    }

    return { point: raw, snapType: 'none', snapped: false }
  }
}

export const snapManager = new SnapManager()

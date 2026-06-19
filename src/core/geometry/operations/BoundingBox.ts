// ─── Geometry Operations: BoundingBox ─────────────────────────────────────

import type { IPoint, IBoundingBox } from '../../../types/geometry.types'

export function computeBoundingBox(points: IPoint[]): IBoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

export function expandBoundingBox(box: IBoundingBox, margin: number): IBoundingBox {
  return {
    minX: box.minX - margin,
    minY: box.minY - margin,
    maxX: box.maxX + margin,
    maxY: box.maxY + margin,
  }
}

export function boundingBoxContains(box: IBoundingBox, p: IPoint): boolean {
  return p.x >= box.minX && p.x <= box.maxX && p.y >= box.minY && p.y <= box.maxY
}

export function boundingBoxIntersects(a: IBoundingBox, b: IBoundingBox): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

export function mergeBoundingBoxes(boxes: IBoundingBox[]): IBoundingBox {
  if (boxes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return boxes.reduce((acc, box) => ({
    minX: Math.min(acc.minX, box.minX),
    minY: Math.min(acc.minY, box.minY),
    maxX: Math.max(acc.maxX, box.maxX),
    maxY: Math.max(acc.maxY, box.maxY),
  }))
}

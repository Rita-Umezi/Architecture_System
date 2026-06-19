// ─── Geometry Operations: Intersect ────────────────────────────────────────

import { Point } from '../primitives/Point'
import { Segment } from '../primitives/Segment'
import type { IPoint } from '../../../types/geometry.types'

/**
 * Segment–segment intersection.
 * Returns the intersection point, or null if the segments don't cross.
 */
export function segmentIntersection(s1: Segment, s2: Segment): Point | null {
  const { start: p1, end: p2 } = s1
  const { start: p3, end: p4 } = s2

  const d1x = p2.x - p1.x, d1y = p2.y - p1.y
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y

  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-10) return null  // parallel

  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom

  if (t < 0 || t > 1 || u < 0 || u > 1) return null  // outside segments

  return new Point(p1.x + t * d1x, p1.y + t * d1y)
}

/**
 * All pairwise intersections among a list of segments.
 */
export function allSegmentIntersections(
  segments: Segment[]
): Array<{ point: Point; i: number; j: number }> {
  const results: Array<{ point: Point; i: number; j: number }> = []
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const pt = segmentIntersection(segments[i], segments[j])
      if (pt) results.push({ point: pt, i, j })
    }
  }
  return results
}

/**
 * Nearest point on a segment to an external point.
 */
export function nearestPointOnSegment(p: IPoint, seg: Segment): Point {
  return seg.closestPoint(p)
}

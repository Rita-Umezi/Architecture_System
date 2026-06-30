// ─── Geometry Operations: Offset ───────────────────────────────────────────
// Offsets a segment or polygon by a given distance.

import { Point } from '../primitives/Point'
import { Segment } from '../primitives/Segment'
import { Polygon } from '../primitives/Polygon'
import { Line } from '../primitives/Line'

/**
 * Offset a segment by `distance` perpendicular to its direction.
 * Positive distance = left side (counter-clockwise), negative = right.
 */
export function offsetSegment(seg: Segment, dist: number): Segment {
  const len = seg.length
  if (len < 1e-10) return seg
  const nx = -(seg.end.y - seg.start.y) / len
  const ny = (seg.end.x - seg.start.x) / len
  return new Segment(
    new Point(seg.start.x + nx * dist, seg.start.y + ny * dist),
    new Point(seg.end.x + nx * dist, seg.end.y + ny * dist),
  )
}

/**
 * Compute the two parallel offset polygons (inner / outer) of a wall segment.
 * Returns [leftPoly, rightPoly] where left is perpendicular-left.
 */
export function wallOffsetPolygon(
  seg: Segment,
  halfThickness: number
): Polygon {
  const left  = offsetSegment(seg, halfThickness)
  const right = offsetSegment(seg, -halfThickness)
  return Polygon.fromPoints([
    left.start,
    left.end,
    right.end,
    right.start,
  ])
}

/**
 * Simple inward/outward offset of a convex polygon.
 * For concave polygons use a full Minkowski sum — this is an approximation.
 */
export function offsetPolygon(polygon: Polygon, dist: number): Polygon {
  const n = polygon.vertices.length
  const newVertices: Point[] = []

  for (let i = 0; i < n; i++) {
    const prev = polygon.vertices[(i - 1 + n) % n]
    const curr = polygon.vertices[i]
    const next = polygon.vertices[(i + 1) % n]

    const seg1 = new Segment(prev, curr)
    const seg2 = new Segment(curr, next)
    const off1 = offsetSegment(seg1, dist)
    const off2 = offsetSegment(seg2, dist)

    const line1 = Line.fromSegment(off1)
    const line2 = Line.fromSegment(off2)
    const intersection = line1.intersect(line2)

    newVertices.push(intersection ?? new Point(
      curr.x + dist * (off1.direction.x + off2.direction.x) / 2,
      curr.y + dist * (off1.direction.y + off2.direction.y) / 2,
    ))
  }

  return new Polygon(newVertices)
}

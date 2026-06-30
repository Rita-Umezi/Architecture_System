// ─── Segment ───────────────────────────────────────────────────────────────

import { Point } from './Point'
import type { IPoint, ISegment } from '../../../types/geometry.types'
import { distance, midpoint, dot, normalize } from '../../../utils/math'

export class Segment implements ISegment {
  constructor(
    public readonly start: Point,
    public readonly end: Point,
  ) {}

  static from(s: ISegment): Segment {
    return new Segment(Point.from(s.start), Point.from(s.end))
  }

  static fromPoints(ax: number, ay: number, bx: number, by: number): Segment {
    return new Segment(new Point(ax, ay), new Point(bx, by))
  }

  get length(): number { return distance(this.start, this.end) }

  get midpoint(): Point { return Point.from(midpoint(this.start, this.end)) }

  get direction(): Point {
    const n = normalize({ x: this.end.x - this.start.x, y: this.end.y - this.start.y })
    return new Point(n.x, n.y)
  }

  get angle(): number {
    return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)
  }

  /** Point at normalised parameter t ∈ [0, 1] */
  pointAt(t: number): Point {
    return new Point(
      this.start.x + t * (this.end.x - this.start.x),
      this.start.y + t * (this.end.y - this.start.y),
    )
  }

  /** Normalised parameter t of the nearest point on this segment to p */
  nearestT(p: IPoint): number {
    const dx = this.end.x - this.start.x
    const dy = this.end.y - this.start.y
    const lenSq = dx * dx + dy * dy
    if (lenSq < 1e-12) return 0
    const t = ((p.x - this.start.x) * dx + (p.y - this.start.y) * dy) / lenSq
    return Math.max(0, Math.min(1, t))
  }

  /** Closest point on this segment to p */
  closestPoint(p: IPoint): Point {
    return this.pointAt(this.nearestT(p))
  }

  /** Distance from point p to this segment */
  distanceToPoint(p: IPoint): number {
    return distance(p, this.closestPoint(p))
  }

  reverse(): Segment { return new Segment(this.end, this.start) }

  toPlain(): ISegment { return { start: this.start.toPlain(), end: this.end.toPlain() } }
}

// ─── Line ──────────────────────────────────────────────────────────────────
// Infinite line in the form ax + by + c = 0

import { Point } from './Point'
import { Segment } from './Segment'
import type { ILine, IPoint } from '../../../types/geometry.types'

export class Line implements ILine {
  constructor(
    public readonly a: number,  // coefficient of x
    public readonly b: number,  // coefficient of y
    public readonly c: number,  // constant term
  ) {}

  /** Create a line from two points */
  static fromPoints(p1: IPoint, p2: IPoint): Line {
    const a = p2.y - p1.y
    const b = p1.x - p2.x
    const c = -(a * p1.x + b * p1.y)
    return new Line(a, b, c)
  }

  /** Create a line from a segment */
  static fromSegment(seg: Segment): Line {
    return Line.fromPoints(seg.start, seg.end)
  }

  /** Perpendicular line through a given point */
  static perpThroughPoint(line: Line, point: IPoint): Line {
    // Swap a and b, adjust c
    return new Line(line.b, -line.a, -(line.b * point.x - line.a * point.y))
  }

  /** Signed distance from point to line (positive = left side) */
  signedDistance(p: IPoint): number {
    const len = Math.sqrt(this.a * this.a + this.b * this.b)
    if (len < 1e-10) return 0
    return (this.a * p.x + this.b * p.y + this.c) / len
  }

  /** Unsigned distance from point to line */
  distance(p: IPoint): number { return Math.abs(this.signedDistance(p)) }

  /** Project a point onto this line */
  project(p: IPoint): Point {
    const len2 = this.a * this.a + this.b * this.b
    if (len2 < 1e-12) return Point.from(p)
    const t = -(this.a * p.x + this.b * p.y + this.c) / len2
    return new Point(p.x + t * this.a, p.y + t * this.b)
  }

  /** Intersection with another line; returns null if parallel */
  intersect(other: Line): Point | null {
    const det = this.a * other.b - other.a * this.b
    if (Math.abs(det) < 1e-10) return null
    const x = (-this.c * other.b + other.c * this.b) / det
    const y = (-this.a * other.c + other.a * this.c) / det
    return new Point(x, y)
  }

  toPlain(): ILine { return { a: this.a, b: this.b, c: this.c } }
}

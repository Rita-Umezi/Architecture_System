// ─── Polygon ───────────────────────────────────────────────────────────────

import { Point } from './Point'
import { Segment } from './Segment'
import type { IPoint, IPolygon, IBoundingBox } from '../../../types/geometry.types'
import { polygonArea, pointInPolygon } from '../../../utils/math'

export class Polygon implements IPolygon {
  constructor(public readonly vertices: Point[]) {}

  static from(p: IPolygon): Polygon {
    return new Polygon(p.vertices.map(Point.from))
  }

  static fromPoints(points: IPoint[]): Polygon {
    return new Polygon(points.map(Point.from))
  }

  get area(): number { return polygonArea(this.vertices) }

  get perimeter(): number {
    return this.segments.reduce((sum, seg) => sum + seg.length, 0)
  }

  get segments(): Segment[] {
    return this.vertices.map((v, i) =>
      new Segment(v, this.vertices[(i + 1) % this.vertices.length])
    )
  }

  get centroid(): Point {
    const n = this.vertices.length
    const sum = this.vertices.reduce(
      (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
      { x: 0, y: 0 }
    )
    return new Point(sum.x / n, sum.y / n)
  }

  get boundingBox(): IBoundingBox {
    const xs = this.vertices.map(v => v.x)
    const ys = this.vertices.map(v => v.y)
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    }
  }

  containsPoint(p: IPoint): boolean {
    return pointInPolygon(p, this.vertices)
  }

  toPlain(): IPolygon {
    return { vertices: this.vertices.map(v => v.toPlain()) }
  }
}

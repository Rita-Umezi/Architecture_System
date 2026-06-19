// ─── Point ─────────────────────────────────────────────────────────────────
// Immutable 2D point value object.

import type { IPoint } from '../../../types/geometry.types'

export class Point implements IPoint {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  static from(p: IPoint): Point { return new Point(p.x, p.y) }
  static origin(): Point { return new Point(0, 0) }

  add(other: IPoint): Point { return new Point(this.x + other.x, this.y + other.y) }
  subtract(other: IPoint): Point { return new Point(this.x - other.x, this.y - other.y) }
  scale(factor: number): Point { return new Point(this.x * factor, this.y * factor) }

  distanceTo(other: IPoint): number {
    const dx = other.x - this.x
    const dy = other.y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  equals(other: IPoint, epsilon = 1e-6): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon
  }

  toPlain(): IPoint { return { x: this.x, y: this.y } }
  toString(): string { return `Point(${this.x.toFixed(2)}, ${this.y.toFixed(2)})` }
}

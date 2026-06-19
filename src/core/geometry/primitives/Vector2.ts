// ─── Vector2 ───────────────────────────────────────────────────────────────

import type { IVector2 } from '../../../types/geometry.types'

export class Vector2 implements IVector2 {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  static zero(): Vector2 { return new Vector2(0, 0) }
  static from(v: IVector2): Vector2 { return new Vector2(v.x, v.y) }
  static fromAngle(angle: number, length = 1): Vector2 {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length)
  }

  get length(): number { return Math.sqrt(this.x * this.x + this.y * this.y) }
  get lengthSq(): number { return this.x * this.x + this.y * this.y }
  get angle(): number { return Math.atan2(this.y, this.x) }

  add(v: IVector2): Vector2 { return new Vector2(this.x + v.x, this.y + v.y) }
  subtract(v: IVector2): Vector2 { return new Vector2(this.x - v.x, this.y - v.y) }
  scale(s: number): Vector2 { return new Vector2(this.x * s, this.y * s) }
  negate(): Vector2 { return new Vector2(-this.x, -this.y) }

  normalize(): Vector2 {
    const len = this.length
    if (len < 1e-10) return Vector2.zero()
    return new Vector2(this.x / len, this.y / len)
  }

  dot(v: IVector2): number { return this.x * v.x + this.y * v.y }
  cross(v: IVector2): number { return this.x * v.y - this.y * v.x }

  /** Perpendicular vector (90° CCW) */
  perpendicular(): Vector2 { return new Vector2(-this.y, this.x) }

  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle), sin = Math.sin(angle)
    return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }

  equals(v: IVector2, epsilon = 1e-6): boolean {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon
  }

  toPlain(): IVector2 { return { x: this.x, y: this.y } }
}

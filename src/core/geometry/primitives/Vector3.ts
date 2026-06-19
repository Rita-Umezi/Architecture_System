// ─── Vector3 ───────────────────────────────────────────────────────────────

import type { IVector3 } from '../../../types/geometry.types'

export class Vector3 implements IVector3 {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  static zero(): Vector3 { return new Vector3(0, 0, 0) }
  static up(): Vector3 { return new Vector3(0, 1, 0) }
  static from(v: IVector3): Vector3 { return new Vector3(v.x, v.y, v.z) }

  get length(): number { return Math.sqrt(this.x**2 + this.y**2 + this.z**2) }

  add(v: IVector3): Vector3 { return new Vector3(this.x+v.x, this.y+v.y, this.z+v.z) }
  subtract(v: IVector3): Vector3 { return new Vector3(this.x-v.x, this.y-v.y, this.z-v.z) }
  scale(s: number): Vector3 { return new Vector3(this.x*s, this.y*s, this.z*s) }
  negate(): Vector3 { return new Vector3(-this.x, -this.y, -this.z) }

  normalize(): Vector3 {
    const len = this.length
    if (len < 1e-10) return Vector3.zero()
    return new Vector3(this.x/len, this.y/len, this.z/len)
  }

  dot(v: IVector3): number { return this.x*v.x + this.y*v.y + this.z*v.z }

  cross(v: IVector3): Vector3 {
    return new Vector3(
      this.y*v.z - this.z*v.y,
      this.z*v.x - this.x*v.z,
      this.x*v.y - this.y*v.x,
    )
  }

  toPlain(): IVector3 { return { x: this.x, y: this.y, z: this.z } }
}

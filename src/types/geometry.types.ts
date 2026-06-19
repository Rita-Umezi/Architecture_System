// ─── Geometry Types ────────────────────────────────────────────────────────

export interface IPoint {
  x: number
  y: number
}

export interface IPoint3D {
  x: number
  y: number
  z: number
}

export interface IVector2 {
  x: number
  y: number
}

export interface IVector3 {
  x: number
  y: number
  z: number
}

export interface ISegment {
  start: IPoint
  end: IPoint
}

export interface IPolygon {
  vertices: IPoint[]
}

export interface IBoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface ILine {
  // ax + by + c = 0
  a: number
  b: number
  c: number
}

export type Axis = 'x' | 'y' | 'z'

export interface ITransform2D {
  x: number
  y: number
  rotation: number // radians
  scaleX: number
  scaleY: number
}

// ─── Math Utilities ────────────────────────────────────────────────────────

import type { IPoint } from '../types/geometry.types'

export const TWO_PI = Math.PI * 2
export const DEG_TO_RAD = Math.PI / 180
export const RAD_TO_DEG = 180 / Math.PI

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Distance between two 2D points */
export function distance(a: IPoint, b: IPoint): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** Squared distance (cheaper, avoids sqrt) */
export function distanceSq(a: IPoint, b: IPoint): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dx * dx + dy * dy
}

/** Angle from point a to point b, in radians */
export function angleBetween(a: IPoint, b: IPoint): number {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

/** Snap a value to the nearest multiple of step */
export function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step
}

/** Snap an angle to nearest increment in degrees */
export function snapAngle(angleRad: number, incrementDeg: number): number {
  const incrementRad = incrementDeg * DEG_TO_RAD
  return Math.round(angleRad / incrementRad) * incrementRad
}

/** Check if two values are approximately equal */
export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) < epsilon
}

/** Midpoint between two points */
export function midpoint(a: IPoint, b: IPoint): IPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Normalize a 2D vector */
export function normalize(v: IPoint): IPoint {
  const len = Math.sqrt(v.x * v.x + v.y * v.y)
  if (len < 1e-10) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

/** Dot product of two 2D vectors */
export function dot(a: IPoint, b: IPoint): number {
  return a.x * b.x + a.y * b.y
}

/** Cross product z-component of two 2D vectors */
export function cross2D(a: IPoint, b: IPoint): number {
  return a.x * b.y - a.y * b.x
}

/** Perpendicular vector (rotated 90° counter-clockwise) */
export function perpendicular(v: IPoint): IPoint {
  return { x: -v.y, y: v.x }
}

/** Round to N decimal places */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/** Polygon area using the Shoelace formula */
export function polygonArea(vertices: IPoint[]): number {
  const n = vertices.length
  if (n < 3) return 0
  let area = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }
  return Math.abs(area) / 2
}

/** Point-in-polygon test using ray casting */
export function pointInPolygon(point: IPoint, polygon: IPoint[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

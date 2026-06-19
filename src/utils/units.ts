// ─── Unit Conversion Utilities ─────────────────────────────────────────────
// Single source of truth for all unit conversions in BuildFlow.
// All internal values are stored in MILLIMETRES.

import type { LengthUnit, AreaUnit, UnitSystem } from '../types/measurement.types'

// ─── Length Conversion Factors (to mm) ────────────────────────────────────
const TO_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
}

export function toMM(value: number, from: LengthUnit): number {
  return value * TO_MM[from]
}

export function fromMM(valueMM: number, to: LengthUnit): number {
  return valueMM / TO_MM[to]
}

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  return fromMM(toMM(value, from), to)
}

// ─── Area Conversion ───────────────────────────────────────────────────────
// Internal area is always mm²

export function mm2ToM2(mm2: number): number { return mm2 / 1_000_000 }
export function mm2ToFt2(mm2: number): number { return mm2 / 92_903.04 }
export function m2ToMM2(m2: number): number   { return m2 * 1_000_000 }
export function ft2ToMM2(ft2: number): number  { return ft2 * 92_903.04 }

export function convertArea(valueMM2: number, to: AreaUnit): number {
  switch (to) {
    case 'm2':   return mm2ToM2(valueMM2)
    case 'ft2':
    case 'sqft': return mm2ToFt2(valueMM2)
    default:     return valueMM2
  }
}

// ─── Formatting ────────────────────────────────────────────────────────────

export function formatLength(
  valueMM: number,
  unit: LengthUnit,
  decimals = 2
): string {
  const converted = fromMM(valueMM, unit)
  return `${converted.toFixed(decimals)} ${unit}`
}

export function formatArea(
  valueMM2: number,
  unit: AreaUnit,
  decimals = 2
): string {
  const converted = convertArea(valueMM2, unit)
  const label = unit === 'sqft' ? 'sq ft' : unit
  return `${converted.toFixed(decimals)} ${label}`
}

export function getDefaultUnits(system: UnitSystem): { length: LengthUnit; area: AreaUnit } {
  if (system === 'imperial') return { length: 'ft', area: 'sqft' }
  return { length: 'm', area: 'm2' }
}

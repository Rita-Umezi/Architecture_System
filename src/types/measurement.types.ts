// ─── Measurement Types ─────────────────────────────────────────────────────

export type UnitSystem = 'metric' | 'imperial'

export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft'
export type AreaUnit = 'm2' | 'ft2' | 'sqft'

export interface IUnitPreference {
  system: UnitSystem
  lengthUnit: LengthUnit
  areaUnit: AreaUnit
  decimalPlaces: number
}

export interface IRoomMetricsResult {
  roomId: string
  area: number              // in m² (raw)
  perimeter: number         // in mm (raw)
  programType: string
  occupancyEstimate: number
  formattedArea: string
  formattedPerimeter: string
}

export interface IWallLengthResult {
  wallId: string
  grossLength: number       // mm
  netLength: number         // mm (minus openings)
  openingCount: number
  formattedGross: string
  formattedNet: string
}

export type MeasurementDisplayMode = 'auto' | 'manual' | 'off'

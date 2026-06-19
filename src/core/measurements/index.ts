// ─── Measurements Module ───────────────────────────────────────────────────

import type { IWallElement, IRoomElement, IDoorElement, IWindowElement } from '../../types/element.types'
import type { IRoomMetricsResult, IWallLengthResult, UnitSystem } from '../../types/measurement.types'
import { polygonArea } from '../../utils/math'
import { formatLength, formatArea, getDefaultUnits } from '../../utils/units'

// ─── Area Calculator ───────────────────────────────────────────────────────

export function calculateRoomArea(vertices: Array<{x: number; y: number}>): number {
  return polygonArea(vertices)  // returns mm²
}

// ─── Perimeter Calculator ─────────────────────────────────────────────────

export function calculateRoomPerimeter(vertices: Array<{x: number; y: number}>): number {
  let perimeter = 0
  const n = vertices.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const dx = vertices[j].x - vertices[i].x
    const dy = vertices[j].y - vertices[i].y
    perimeter += Math.sqrt(dx*dx + dy*dy)
  }
  return perimeter  // mm
}

// ─── Wall Length Calculator ────────────────────────────────────────────────

export function calculateWallGrossLength(wall: IWallElement): number {
  const dx = wall.endPoint.x - wall.startPoint.x
  const dy = wall.endPoint.y - wall.startPoint.y
  return Math.sqrt(dx*dx + dy*dy)  // mm
}

export function calculateWallNetLength(
  wall: IWallElement,
  doors: IDoorElement[],
  windows: IWindowElement[],
): number {
  const gross = calculateWallGrossLength(wall)
  const wallDoors   = doors.filter(d => d.hostWallId === wall.id)
  const wallWindows = windows.filter(w => w.hostWallId === wall.id)
  const totalOpenings = [...wallDoors.map(d => d.width), ...wallWindows.map(w => w.width)]
    .reduce((sum, w) => sum + w, 0)
  return Math.max(0, gross - totalOpenings)
}

// ─── Room Metrics ─────────────────────────────────────────────────────────

const OCCUPANCY_RATES: Record<string, number> = {
  office:   10,       // m² per person
  bedroom:  15,
  living:   8,
  kitchen:  12,
  corridor: 20,
  default:  10,
}

export function getRoomMetrics(
  room: IRoomElement,
  vertices: Array<{x: number; y: number}>,
  unitSystem: UnitSystem = 'metric',
): IRoomMetricsResult {
  const areaMM2 = calculateRoomArea(vertices)
  const perimMM = calculateRoomPerimeter(vertices)
  const { length, area } = getDefaultUnits(unitSystem)

  const areaM2 = areaMM2 / 1_000_000
  const rate = OCCUPANCY_RATES[room.programType] ?? OCCUPANCY_RATES.default
  const occupancy = Math.floor(areaM2 / rate)

  return {
    roomId:            room.id,
    area:              areaMM2,
    perimeter:         perimMM,
    programType:       room.programType,
    occupancyEstimate: occupancy,
    formattedArea:     formatArea(areaMM2, area),
    formattedPerimeter:formatLength(perimMM, length),
  }
}

// ─── Wall Length Result ────────────────────────────────────────────────────

export function getWallLengthResult(
  wall: IWallElement,
  doors: IDoorElement[],
  windows: IWindowElement[],
  unitSystem: UnitSystem = 'metric',
): IWallLengthResult {
  const gross = calculateWallGrossLength(wall)
  const net   = calculateWallNetLength(wall, doors, windows)
  const { length } = getDefaultUnits(unitSystem)
  const openings = doors.filter(d => d.hostWallId === wall.id).length +
                   windows.filter(w => w.hostWallId === wall.id).length
  return {
    wallId: wall.id,
    grossLength: gross, netLength: net, openingCount: openings,
    formattedGross: formatLength(gross, length),
    formattedNet:   formatLength(net, length),
  }
}

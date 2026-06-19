// ─── Wall Element Factory ──────────────────────────────────────────────────

import { generateId } from '../../utils/id'
import type { IWallElement, WallType } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'

export const DEFAULT_WALL_THICKNESS = 200  // mm
export const DEFAULT_WALL_HEIGHT    = 2700 // mm

export function createWall(
  startPoint: IPoint,
  endPoint: IPoint,
  layerId: string,
  options: Partial<{
    thickness: number
    height: number
    wallType: WallType
    materialId: string
  }> = {}
): IWallElement {
  return {
    id: generateId(),
    type: 'wall',
    startPoint,
    endPoint,
    thickness: options.thickness ?? DEFAULT_WALL_THICKNESS,
    height:    options.height    ?? DEFAULT_WALL_HEIGHT,
    wallType:  options.wallType  ?? 'interior',
    layerId,
    materialId: options.materialId,
    openings: [],
    properties: {},
  }
}

export function wallLength(wall: IWallElement): number {
  const dx = wall.endPoint.x - wall.startPoint.x
  const dy = wall.endPoint.y - wall.startPoint.y
  return Math.sqrt(dx * dx + dy * dy)
}

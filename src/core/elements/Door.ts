import { generateId } from '../../utils/id'
import type { IDoorElement, DoorType } from '../../types/element.types'

export function createDoor(
  hostWallId: string,
  positionAlongWall: number,
  layerId: string,
  options: Partial<{
    width: number; height: number
    doorType: DoorType
    swingAngle: number
    swingDirection: 'left' | 'right'
    materialId: string
  }> = {}
): IDoorElement {
  return {
    id: generateId(),
    type: 'door',
    hostWallId,
    positionAlongWall,
    width:          options.width          ?? 900,
    height:         options.height         ?? 2100,
    doorType:       options.doorType       ?? 'single',
    swingAngle:     options.swingAngle     ?? 90,
    swingDirection: options.swingDirection ?? 'left',
    layerId,
    materialId: options.materialId,
    properties: {},
  }
}

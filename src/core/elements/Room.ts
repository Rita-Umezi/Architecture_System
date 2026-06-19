import { generateId } from '../../utils/id'
import type { IRoomElement } from '../../types/element.types'

export function createRoom(
  name: string,
  programType: string,
  boundaryWallIds: string[],
  layerId: string,
  options: Partial<{ color: string }> = {}
): IRoomElement {
  return {
    id: generateId(),
    type: 'room',
    name,
    programType,
    boundaryWallIds,
    confirmed: false,
    layerId,
    color: options.color,
    properties: {},
  }
}

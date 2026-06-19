import { generateId } from '../../utils/id'
import type { IStairElement, StairType } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'

export function createStair(
  origin: IPoint, layerId: string,
  options: Partial<{ width: number; totalRise: number; numberOfRisers: number; stairType: StairType }> = {}
): IStairElement {
  return {
    id: generateId(), type: 'stair', origin,
    width: options.width ?? 1200,
    totalRise: options.totalRise ?? 3000,
    numberOfRisers: options.numberOfRisers ?? 17,
    stairType: options.stairType ?? 'straight',
    layerId, properties: {},
  }
}

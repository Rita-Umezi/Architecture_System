import { generateId } from '../../utils/id'
import type { IBeamElement } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'

export function createBeam(startPoint: IPoint, endPoint: IPoint, layerId: string,
  options: Partial<{ width: number; depth: number; materialId: string }> = {}
): IBeamElement {
  return {
    id: generateId(), type: 'beam', startPoint, endPoint,
    width: options.width ?? 300,
    depth: options.depth ?? 500,
    layerId, materialId: options.materialId, properties: {},
  }
}

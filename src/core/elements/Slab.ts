import { generateId } from '../../utils/id'
import type { ISlabElement } from '../../types/element.types'

export function createSlab(roomId: string, layerId: string,
  options: Partial<{ thickness: number; elevation: number; materialId: string }> = {}
): ISlabElement {
  return {
    id: generateId(), type: 'slab', roomId,
    thickness: options.thickness ?? 200,
    elevation: options.elevation ?? 0,
    layerId, materialId: options.materialId, properties: {},
  }
}

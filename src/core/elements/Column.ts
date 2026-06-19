import { generateId } from '../../utils/id'
import type { IColumnElement } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'

export function createColumn(position: IPoint, layerId: string,
  options: Partial<{ width: number; depth: number; height: number; shape: 'rectangular'|'circular'; materialId: string }> = {}
): IColumnElement {
  return {
    id: generateId(), type: 'column', position,
    width:  options.width  ?? 400,
    depth:  options.depth  ?? 400,
    height: options.height ?? 3000,
    shape:  options.shape  ?? 'rectangular',
    layerId, materialId: options.materialId, properties: {},
  }
}

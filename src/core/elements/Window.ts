import { generateId } from '../../utils/id'
import type { IWindowElement, WindowType } from '../../types/element.types'

export function createWindow(
  hostWallId: string,
  positionAlongWall: number,
  layerId: string,
  options: Partial<{
    width: number; height: number; sillHeight: number
    windowType: WindowType; materialId: string
  }> = {}
): IWindowElement {
  return {
    id: generateId(),
    type: 'window',
    hostWallId,
    positionAlongWall,
    width:       options.width       ?? 1200,
    height:      options.height      ?? 1200,
    sillHeight:  options.sillHeight  ?? 900,
    windowType:  options.windowType  ?? 'casement',
    layerId,
    materialId: options.materialId,
    properties: {},
  }
}

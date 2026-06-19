// ─── Layer ─────────────────────────────────────────────────────────────────

import type { ILayer } from '../../types/scene.types'
import { generateId } from '../../utils/id'

export class Layer implements ILayer {
  constructor(
    public readonly id: string,
    public name: string,
    public visible = true,
    public locked = false,
    public color = '#6366f1',
    public order = 0,
  ) {}

  static create(name: string, order = 0): Layer {
    return new Layer(generateId(), name, true, false, '#6366f1', order)
  }
}

export const DEFAULT_LAYERS: ILayer[] = [
  { id: 'layer-walls',       name: 'Walls',       visible: true, locked: false, color: '#334155', order: 0 },
  { id: 'layer-doors',       name: 'Doors',       visible: true, locked: false, color: '#6366f1', order: 1 },
  { id: 'layer-windows',     name: 'Windows',     visible: true, locked: false, color: '#06b6d4', order: 2 },
  { id: 'layer-rooms',       name: 'Rooms',       visible: true, locked: false, color: '#10b981', order: 3 },
  { id: 'layer-dimensions',  name: 'Dimensions',  visible: true, locked: false, color: '#f59e0b', order: 4 },
  { id: 'layer-annotations', name: 'Annotations', visible: true, locked: false, color: '#f43f5e', order: 5 },
]

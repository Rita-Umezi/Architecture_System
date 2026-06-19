// ─── Scene Types ───────────────────────────────────────────────────────────

import type { ElementType } from './element.types'

export interface ISceneNode {
  id: string
  type: ElementType
  elementId: string          // FK to the concrete element object
  layerId: string
  visible: boolean
  locked: boolean
  selected: boolean
  metadata: Record<string, unknown>
}

export interface ILayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color: string
  order: number
}

export interface IScenePatch {
  added: ISceneNode[]
  updated: ISceneNode[]
  removed: string[]          // node IDs
}

export interface IViewport {
  mode: '2d' | '3d'
  zoom: number
  panX: number
  panY: number
  panZ?: number
}

export interface ISelectionBox {
  x: number
  y: number
  width: number
  height: number
}

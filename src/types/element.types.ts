// ─── Architectural Element Types ───────────────────────────────────────────

import type { IPoint } from './geometry.types'

export type ElementType =
  | 'wall'
  | 'door'
  | 'window'
  | 'room'
  | 'slab'
  | 'stair'
  | 'column'
  | 'beam'
  | 'roof'
  | 'terrain'
  | 'furniture'
  | 'annotation'

export type WallType = 'exterior' | 'interior' | 'partition' | 'curtain' | 'retaining'
export type DoorType = 'single' | 'double' | 'sliding' | 'bifold' | 'pocket' | 'french'
export type WindowType = 'casement' | 'sliding' | 'fixed' | 'awning' | 'bay' | 'skylight'
export type RoofType = 'gable' | 'hip' | 'flat' | 'shed' | 'mansard' | 'gambrel'
export type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral' | 'winder'

export interface IWallElement {
  id: string
  type: 'wall'
  startPoint: IPoint
  endPoint: IPoint
  thickness: number       // mm
  height: number          // mm
  wallType: WallType
  layerId: string
  materialId?: string
  structuralType?: string
  openings: string[]      // IDs of hosted doors/windows
  properties: Record<string, unknown>
  bimMetadataId?: string
}

export interface IDoorElement {
  id: string
  type: 'door'
  hostWallId: string
  positionAlongWall: number  // 0–1 normalized
  width: number              // mm
  height: number             // mm
  doorType: DoorType
  swingAngle: number         // degrees, 0–180
  swingDirection: 'left' | 'right'
  layerId: string
  materialId?: string
  properties: Record<string, unknown>
  bimMetadataId?: string
}

export interface IWindowElement {
  id: string
  type: 'window'
  hostWallId: string
  positionAlongWall: number  // 0–1 normalized
  width: number              // mm
  height: number             // mm
  sillHeight: number         // mm from floor
  windowType: WindowType
  layerId: string
  materialId?: string
  properties: Record<string, unknown>
  bimMetadataId?: string
}

export interface IRoomElement {
  id: string
  type: 'room'
  name: string
  programType: string        // 'bedroom', 'kitchen', 'office', etc.
  boundaryWallIds: string[]  // derived from FaceDetector
  confirmed: boolean         // user has named/confirmed this room
  layerId: string
  color?: string
  properties: Record<string, unknown>
  bimMetadataId?: string
}

export interface ISlabElement {
  id: string
  type: 'slab'
  roomId: string
  thickness: number          // mm
  elevation: number          // mm from datum
  layerId: string
  materialId?: string
  properties: Record<string, unknown>
}

export interface IStairElement {
  id: string
  type: 'stair'
  origin: IPoint
  width: number
  totalRise: number
  numberOfRisers: number
  stairType: StairType
  layerId: string
  properties: Record<string, unknown>
}

export interface IColumnElement {
  id: string
  type: 'column'
  position: IPoint
  width: number
  depth: number
  height: number
  shape: 'rectangular' | 'circular'
  layerId: string
  materialId?: string
  properties: Record<string, unknown>
}

export interface IBeamElement {
  id: string
  type: 'beam'
  startPoint: IPoint
  endPoint: IPoint
  width: number
  depth: number
  layerId: string
  materialId?: string
  properties: Record<string, unknown>
}

export type ArchitecturalElement =
  | IWallElement
  | IDoorElement
  | IWindowElement
  | IRoomElement
  | ISlabElement
  | IStairElement
  | IColumnElement
  | IBeamElement

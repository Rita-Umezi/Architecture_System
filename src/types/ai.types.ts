// ─── AI System Types ───────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'anthropic' | 'gemini'

export type AIGenerationType = 'floorplan' | 'elevation' | 'furniture'

export type AITaskStatus = 'idle' | 'pending' | 'running' | 'complete' | 'error'

export interface IAITask {
  id: string
  type: AIGenerationType
  provider: AIProvider
  prompt: string
  status: AITaskStatus
  progress: number          // 0–100
  result?: IAIResult
  error?: string
  createdAt: string
}

export interface IAIResult {
  taskId: string
  type: AIGenerationType
  rawResponse: string
  parsedData: IFloorPlanAIData | IElevationAIData | IFurnitureAIData
  confidence: number        // 0–1
}

export interface IRoomDefinition {
  name: string
  programType: string
  width: number             // mm
  height: number            // mm
  x: number                 // mm from origin
  y: number                 // mm from origin
  connections: string[]     // connected room names
}

export interface IFloorPlanAIData {
  totalArea: number         // m²
  buildingType: string
  rooms: IRoomDefinition[]
  walls: Array<{
    startX: number; startY: number
    endX: number; endY: number
    thickness: number
    wallType: string
  }>
}

export interface IElevationAIData {
  face: 'front' | 'rear' | 'left' | 'right'
  elements: Array<{
    type: string
    x: number; y: number
    width: number; height: number
  }>
}

export interface IFurnitureAIData {
  roomId: string
  programType: string
  items: Array<{
    assetId: string
    x: number; y: number
    rotation: number
  }>
}

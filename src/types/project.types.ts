// ─── Project Types ─────────────────────────────────────────────────────────

export interface IFloor {
  id: string
  name: string              // "Ground Floor", "First Floor"
  level: number             // 0, 1, 2 ...
  floorHeight: number       // mm — floor-to-floor height
  sceneGraphId: string      // each floor has its own scene graph
}

export interface IProject {
  id: string
  name: string
  description?: string
  ownerId: string
  collaboratorIds: string[]
  floors: IFloor[]
  activeFloorId: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
  thumbnail?: string
  tags: string[]
  metadata: Record<string, unknown>
}

export interface IProjectSummary {
  id: string
  name: string
  thumbnail?: string
  updatedAt: string
  collaboratorCount: number
}

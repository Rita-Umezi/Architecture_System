// ─── Export Types ──────────────────────────────────────────────────────────

export type ExportFormat = 'pdf' | 'png' | 'svg' | 'obj' | 'glb' | 'fbx' | 'stl'

export type ExportStatus = 'pending' | 'processing' | 'complete' | 'error'

export type ExportScope = 'current-view' | 'all-floors' | 'selected-floor'

export interface IExportOptions {
  format: ExportFormat
  scope: ExportScope
  floorId?: string
  scale?: number            // 1:50, 1:100, etc (2D only)
  dpi?: number              // for raster exports
  includeAnnotations?: boolean
  includeGrid?: boolean
  includeDimensions?: boolean
  paperSize?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'letter' | 'tabloid'
  orientation?: 'portrait' | 'landscape'
}

export interface IExportJob {
  id: string
  projectId: string
  options: IExportOptions
  status: ExportStatus
  progress: number          // 0–100
  downloadUrl?: string
  error?: string
  createdAt: string
  completedAt?: string
}

export interface IProjectSnapshot {
  projectId: string
  schemaVersion: number
  exportedAt: string
  floors: Array<{
    floorId: string
    floorName: string
    elements: unknown[]
    layers: unknown[]
  }>
}

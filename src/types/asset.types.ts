// ─── Asset Library Types ───────────────────────────────────────────────────

export type AssetCategory =
  | 'furniture' | 'material' | 'door' | 'window'
  | 'roof' | 'stair' | 'landscaping' | 'structural'

export type AssetLicense = 'built-in' | 'cc0' | 'cc-by' | 'commercial' | 'marketplace'

export interface IAsset {
  id: string
  name: string
  category: AssetCategory
  subcategory: string
  tags: string[]
  thumbnail: string         // URL or base64
  modelUrl?: string         // GLTF/GLB URL for 3D
  svgUrl?: string           // SVG URL for 2D symbol
  dimensions: {
    width: number; depth: number; height: number   // mm
  }
  polygonCount?: number
  license: AssetLicense
  authorId?: string
  version: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface IAssetSearchQuery {
  query?: string
  category?: AssetCategory
  subcategory?: string
  tags?: string[]
  page: number
  pageSize: number
}

export interface IAssetSearchResult {
  assets: IAsset[]
  total: number
  page: number
  pageSize: number
}

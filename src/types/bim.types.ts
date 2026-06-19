// ─── BIM Types ─────────────────────────────────────────────────────────────
// Field names intentionally mirror IFC4 property set conventions.

export type OccupancyClass =
  | 'residential' | 'commercial' | 'industrial' | 'educational'
  | 'healthcare' | 'assembly' | 'mixed-use'

export interface IElementBIMMetadata {
  id: string
  elementId: string
  structuralType: 'load-bearing' | 'non-load-bearing' | 'partition' | 'unknown'
  fireRating: string        // e.g. "60 min", "REI 90"
  acousticRating?: number   // dB Rw
  thermalTransmittance?: number  // U-value W/(m²·K)
  ifcEntityType?: string    // e.g. "IfcWall", "IfcDoor"
}

export interface IMaterialBIMMetadata {
  id: string
  name: string
  category: string
  density?: number          // kg/m³
  costPerUnit?: number      // currency per unit
  unit: string              // m², m³, linear m
  sustainabilityRating?: string  // LEED/BREEAM category
  finishType?: string
  manufacturer?: string
  ifcMaterialName?: string
}

export interface IBuildingBIMMetadata {
  id: string
  projectId: string
  buildingName: string
  address?: string
  grossFloorArea: number    // m²
  numberOfFloors: number
  occupancyClass: OccupancyClass
  yearBuilt?: number
  constructionType?: string
  ifcGlobalId?: string
}

export interface ISpaceBIMMetadata {
  id: string
  roomId: string
  programType: string
  occupancyLoad?: number    // persons
  hvacZone?: string
  fireCompartment?: string
  acousticZone?: string
  ifcSpaceType?: string
}

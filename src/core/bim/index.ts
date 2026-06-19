// ─── BIM Metadata Layer ────────────────────────────────────────────────────

import type { IElementBIMMetadata, IMaterialBIMMetadata, IBuildingBIMMetadata, ISpaceBIMMetadata, OccupancyClass } from '../../types/bim.types'
import { generateId } from '../../utils/id'

export function createElementBIMMetadata(elementId: string,
  overrides: Partial<IElementBIMMetadata> = {}): IElementBIMMetadata {
  return {
    id: generateId(), elementId,
    structuralType: 'non-load-bearing',
    fireRating: 'REI 30',
    ...overrides,
  }
}

export function createMaterialBIMMetadata(name: string, category: string,
  overrides: Partial<IMaterialBIMMetadata> = {}): IMaterialBIMMetadata {
  return {
    id: generateId(), name, category, unit: 'm²',
    ...overrides,
  }
}

export function createBuildingBIMMetadata(projectId: string, buildingName: string,
  overrides: Partial<IBuildingBIMMetadata> = {}): IBuildingBIMMetadata {
  return {
    id: generateId(), projectId, buildingName,
    grossFloorArea: 0, numberOfFloors: 1,
    occupancyClass: 'residential' as OccupancyClass,
    ...overrides,
  }
}

export function createSpaceBIMMetadata(roomId: string, programType: string,
  overrides: Partial<ISpaceBIMMetadata> = {}): ISpaceBIMMetadata {
  return {
    id: generateId(), roomId, programType,
    ifcSpaceType: `IfcSpace.${programType.toUpperCase()}`,
    ...overrides,
  }
}

export { type IElementBIMMetadata, type IMaterialBIMMetadata, type IBuildingBIMMetadata, type ISpaceBIMMetadata }

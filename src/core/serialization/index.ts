// ─── Project Serializer ────────────────────────────────────────────────────

import type { SceneGraph } from '../scene/SceneGraph'
import type { IProject } from '../../types/project.types'

export const CURRENT_SCHEMA_VERSION = 1

export interface IProjectDocument {
  schemaVersion: number
  project: Omit<IProject, 'schemaVersion'>
  elements: unknown[]
  layers: unknown[]
  exportedAt: string
}

export class ProjectSerializer {
  static serialize(project: IProject, scene: SceneGraph): IProjectDocument {
    const snap = scene.snapshot()
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { ...project },
      elements: snap.elements,
      layers:   snap.layers,
      exportedAt: new Date().toISOString(),
    }
  }
}

export class ProjectDeserializer {
  static deserialize(doc: IProjectDocument): {
    project: IProject
    elements: unknown[]
    layers: unknown[]
  } {
    const { schemaVersion, project, elements, layers } = doc

    if (schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.warn(`[Deserializer] Schema version mismatch: ${schemaVersion} vs ${CURRENT_SCHEMA_VERSION}`)
      // Future: run migration chain here
    }

    return {
      project: { ...project, schemaVersion: CURRENT_SCHEMA_VERSION } as IProject,
      elements,
      layers,
    }
  }
}

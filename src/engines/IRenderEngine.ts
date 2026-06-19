// ─── IRenderEngine ─────────────────────────────────────────────────────────
// The shared contract that both 2D (Konva) and 3D (R3F) engines implement.
// Engines are stateless renderers — they never write to the SceneGraph.

import type { SceneGraph } from '../core/scene/SceneGraph'
import type { IScenePatch, IViewport } from '../types/scene.types'
import type { IPoint } from '../types/geometry.types'
import type { SceneNode } from '../core/scene/SceneNode'

export interface IRenderEngine {
  /** Mount the engine into a DOM container */
  mount(container: HTMLElement): void

  /** Unmount and clean up all resources */
  unmount(): void

  /** Full sync when engine first loads or switches */
  syncScene(graph: SceneGraph): void

  /** Incremental update from a scene patch */
  applyPatch(patch: IScenePatch): void

  /** Update viewport: zoom, pan, mode */
  setViewport(viewport: IViewport): void

  /** Hit-test a canvas point and return the nearest SceneNode */
  hitTest(canvasPoint: IPoint): SceneNode | null

  /** Clean up GPU/canvas resources */
  dispose(): void
}

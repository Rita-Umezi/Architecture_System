// ─── SceneNode ─────────────────────────────────────────────────────────────

import type { ISceneNode } from '../../types/scene.types'
import type { ElementType } from '../../types/element.types'

export class SceneNode implements ISceneNode {
  constructor(
    public readonly id: string,
    public readonly type: ElementType,
    public readonly elementId: string,
    public layerId: string,
    public visible = true,
    public locked = false,
    public selected = false,
    public metadata: Record<string, unknown> = {},
  ) {}

  clone(): SceneNode {
    return new SceneNode(
      this.id, this.type, this.elementId,
      this.layerId, this.visible, this.locked, this.selected,
      { ...this.metadata }
    )
  }
}

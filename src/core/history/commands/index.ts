// ─── Concrete Commands ─────────────────────────────────────────────────────

import { generateId } from '../../../utils/id'
import { createWall, createDoor, createWindow } from '../../elements'
import type { ICommand } from '../CommandBus'
import type { SceneGraph } from '../../scene/SceneGraph'
import type { IWallElement, IDoorElement, IWindowElement, ArchitecturalElement } from '../../../types/element.types'
import type { IPoint } from '../../../types/geometry.types'

// ─── Add Wall ─────────────────────────────────────────────────────────────

export class AddWallCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'add-wall'
  private wall: IWallElement

  constructor(
    startPoint: IPoint, endPoint: IPoint, layerId: string,
    options: { thickness?: number; height?: number } = {}
  ) {
    this.wall = createWall(startPoint, endPoint, layerId, options)
  }

  validate(scene: SceneGraph): string | null {
    const dx = this.wall.endPoint.x - this.wall.startPoint.x
    const dy = this.wall.endPoint.y - this.wall.startPoint.y
    if (Math.sqrt(dx*dx + dy*dy) < 10) return 'Wall is too short (min 10mm)'
    return null
  }

  execute(scene: SceneGraph): void { scene.addElement(this.wall) }
  undo(scene: SceneGraph): void { scene.removeElement(this.wall.id) }

  get wallId(): string { return this.wall.id }
}

// ─── Delete Element ───────────────────────────────────────────────────────

export class DeleteElementCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'delete-element'
  private savedElement: ArchitecturalElement | null = null

  constructor(private elementId: string) {}

  validate(scene: SceneGraph): string | null {
    if (!scene.getElement(this.elementId)) return 'Element not found'
    return null
  }

  execute(scene: SceneGraph): void {
    this.savedElement = scene.getElement(this.elementId) ?? null
    scene.removeElement(this.elementId)
  }

  undo(scene: SceneGraph): void {
    if (this.savedElement) scene.addElement(this.savedElement)
  }
}

// ─── Move Node (update start/end) ─────────────────────────────────────────

export class MoveWallCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'move-wall'
  private prevStart?: IPoint
  private prevEnd?: IPoint

  constructor(
    private wallId: string,
    private newStart: IPoint,
    private newEnd: IPoint,
  ) {}

  validate(scene: SceneGraph): string | null {
    if (!scene.getElement(this.wallId)) return 'Wall not found'
    return null
  }

  execute(scene: SceneGraph): void {
    const wall = scene.getElement<IWallElement>(this.wallId)
    if (!wall) return
    this.prevStart = { ...wall.startPoint }
    this.prevEnd   = { ...wall.endPoint }
    scene.updateElement(this.wallId, { startPoint: this.newStart, endPoint: this.newEnd })
  }

  undo(scene: SceneGraph): void {
    if (this.prevStart && this.prevEnd) {
      scene.updateElement(this.wallId, { startPoint: this.prevStart, endPoint: this.prevEnd })
    }
  }
}

// ─── Add Door ─────────────────────────────────────────────────────────────

export class AddDoorCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'add-door'
  private door: IDoorElement

  constructor(hostWallId: string, position: number, layerId: string,
    options: { width?: number; height?: number } = {}) {
    this.door = createDoor(hostWallId, position, layerId, options)
  }

  validate(scene: SceneGraph): string | null {
    if (!scene.getElement(this.door.hostWallId)) return 'Host wall not found — door requires a valid wall'
    return null
  }

  execute(scene: SceneGraph): void {
    scene.addElement(this.door)
    const wall = scene.getElement<IWallElement>(this.door.hostWallId)
    if (wall) scene.updateElement(wall.id, { openings: [...wall.openings, this.door.id] })
  }

  undo(scene: SceneGraph): void {
    scene.removeElement(this.door.id)
    const wall = scene.getElement<IWallElement>(this.door.hostWallId)
    if (wall) scene.updateElement(wall.id, { openings: wall.openings.filter(id => id !== this.door.id) })
  }
}

// ─── Add Window ───────────────────────────────────────────────────────────

export class AddWindowCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'add-window'
  private window: IWindowElement

  constructor(hostWallId: string, position: number, layerId: string,
    options: { width?: number; height?: number; sillHeight?: number } = {}) {
    this.window = createWindow(hostWallId, position, layerId, options)
  }

  validate(scene: SceneGraph): string | null {
    if (!scene.getElement(this.window.hostWallId)) return 'Host wall not found'
    return null
  }

  execute(scene: SceneGraph): void {
    scene.addElement(this.window)
    const wall = scene.getElement<IWallElement>(this.window.hostWallId)
    if (wall) scene.updateElement(wall.id, { openings: [...wall.openings, this.window.id] })
  }

  undo(scene: SceneGraph): void {
    scene.removeElement(this.window.id)
    const wall = scene.getElement<IWallElement>(this.window.hostWallId)
    if (wall) scene.updateElement(wall.id, { openings: wall.openings.filter(id => id !== this.window.id) })
  }
}

// ─── Batch Command ────────────────────────────────────────────────────────

export class BatchCommand implements ICommand {
  readonly id = generateId()
  readonly type = 'batch'

  constructor(
    private commands: ICommand[],
    public readonly description = 'Batch operation'
  ) {}

  validate(scene: SceneGraph): string | null {
    for (const cmd of this.commands) {
      const err = cmd.validate(scene)
      if (err) return err
    }
    return null
  }

  execute(scene: SceneGraph): void {
    for (const cmd of this.commands) cmd.execute(scene)
  }

  undo(scene: SceneGraph): void {
    for (const cmd of [...this.commands].reverse()) cmd.undo(scene)
  }
}

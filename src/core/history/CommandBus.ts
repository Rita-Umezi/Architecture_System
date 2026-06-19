// ─── Command Pattern ────────────────────────────────────────────────────────
// Every mutation to the SceneGraph is a reversible Command.

import type { SceneGraph } from '../scene/SceneGraph'

// ─── Command Interface ─────────────────────────────────────────────────────

export interface ICommand {
  readonly id: string
  readonly type: string
  execute(scene: SceneGraph): void
  undo(scene: SceneGraph): void
  validate(scene: SceneGraph): string | null   // returns error message or null
}

// ─── Command Bus ───────────────────────────────────────────────────────────

type CommandListener = (command: ICommand, action: 'execute' | 'undo' | 'redo') => void

export class CommandBus {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private listeners: Set<CommandListener> = new Set()
  private maxUndoDepth = 100

  constructor(private scene: SceneGraph) {}

  dispatch(command: ICommand): boolean {
    const error = command.validate(this.scene)
    if (error) {
      console.warn(`[CommandBus] Validation failed for ${command.type}: ${error}`)
      return false
    }

    command.execute(this.scene)
    this.undoStack.push(command)
    this.redoStack = []  // Clear redo on new command

    if (this.undoStack.length > this.maxUndoDepth) {
      this.undoStack.shift()
    }

    this.notify(command, 'execute')
    return true
  }

  undo(): boolean {
    const command = this.undoStack.pop()
    if (!command) return false
    command.undo(this.scene)
    this.redoStack.push(command)
    this.notify(command, 'undo')
    return true
  }

  redo(): boolean {
    const command = this.redoStack.pop()
    if (!command) return false
    command.execute(this.scene)
    this.undoStack.push(command)
    this.notify(command, 'redo')
    return true
  }

  get canUndo(): boolean { return this.undoStack.length > 0 }
  get canRedo(): boolean { return this.redoStack.length > 0 }
  get undoDepth(): number { return this.undoStack.length }

  subscribe(listener: CommandListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(command: ICommand, action: 'execute' | 'undo' | 'redo'): void {
    for (const listener of this.listeners) listener(command, action)
  }
}

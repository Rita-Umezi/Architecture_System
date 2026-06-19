// ─── Constraint System ─────────────────────────────────────────────────────

import type { IWallElement } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'

// ─── Constraint Interface ──────────────────────────────────────────────────

export interface IConstraintMutation {
  elementId: string
  field: string
  value: unknown
}

export interface IConstraint {
  id: string
  type: string
  elementIds: string[]
  solve(elements: Map<string, IWallElement>): IConstraintMutation[]
}

// ─── Parallel Constraint ───────────────────────────────────────────────────

export class ParallelConstraint implements IConstraint {
  readonly type = 'parallel'
  constructor(
    public readonly id: string,
    public readonly elementIds: [string, string],
    public readonly anchorId: string,   // which wall is the "anchor" (not moved)
  ) {}

  solve(elements: Map<string, IWallElement>): IConstraintMutation[] {
    const [idA, idB] = this.elementIds
    const anchor = elements.get(this.anchorId)
    const follower = elements.get(idA === this.anchorId ? idB : idA)
    if (!anchor || !follower) return []

    const dx = anchor.endPoint.x - anchor.startPoint.x
    const dy = anchor.endPoint.y - anchor.startPoint.y
    const len = Math.sqrt(dx*dx + dy*dy)
    if (len < 1e-6) return []

    const fLen = Math.sqrt(
      (follower.endPoint.x - follower.startPoint.x)**2 +
      (follower.endPoint.y - follower.startPoint.y)**2
    )
    const newEnd: IPoint = {
      x: follower.startPoint.x + (dx/len) * fLen,
      y: follower.startPoint.y + (dy/len) * fLen,
    }
    return [{ elementId: follower.id, field: 'endPoint', value: newEnd }]
  }
}

// ─── Perpendicular Constraint ─────────────────────────────────────────────

export class PerpendicularConstraint implements IConstraint {
  readonly type = 'perpendicular'
  constructor(
    public readonly id: string,
    public readonly elementIds: [string, string],
    public readonly anchorId: string,
  ) {}

  solve(elements: Map<string, IWallElement>): IConstraintMutation[] {
    const [idA, idB] = this.elementIds
    const anchor = elements.get(this.anchorId)
    const follower = elements.get(idA === this.anchorId ? idB : idA)
    if (!anchor || !follower) return []

    // Perpendicular direction = rotate anchor direction 90°
    const dx = anchor.endPoint.x - anchor.startPoint.x
    const dy = anchor.endPoint.y - anchor.startPoint.y
    const len = Math.sqrt(dx*dx + dy*dy)
    if (len < 1e-6) return []

    const fLen = Math.sqrt(
      (follower.endPoint.x - follower.startPoint.x)**2 +
      (follower.endPoint.y - follower.startPoint.y)**2
    )
    const newEnd: IPoint = {
      x: follower.startPoint.x + (-dy/len) * fLen,
      y: follower.startPoint.y + (dx/len) * fLen,
    }
    return [{ elementId: follower.id, field: 'endPoint', value: newEnd }]
  }
}

// ─── Equal Length Constraint ──────────────────────────────────────────────

export class EqualLengthConstraint implements IConstraint {
  readonly type = 'equal-length'
  constructor(
    public readonly id: string,
    public readonly elementIds: [string, string],
    public readonly anchorId: string,
  ) {}

  solve(elements: Map<string, IWallElement>): IConstraintMutation[] {
    const [idA, idB] = this.elementIds
    const anchor = elements.get(this.anchorId)
    const follower = elements.get(idA === this.anchorId ? idB : idA)
    if (!anchor || !follower) return []

    const anchorLen = Math.sqrt(
      (anchor.endPoint.x - anchor.startPoint.x)**2 +
      (anchor.endPoint.y - anchor.startPoint.y)**2
    )
    const fDx = follower.endPoint.x - follower.startPoint.x
    const fDy = follower.endPoint.y - follower.startPoint.y
    const fLen = Math.sqrt(fDx*fDx + fDy*fDy)
    if (fLen < 1e-6) return []

    const newEnd: IPoint = {
      x: follower.startPoint.x + (fDx/fLen) * anchorLen,
      y: follower.startPoint.y + (fDy/fLen) * anchorLen,
    }
    return [{ elementId: follower.id, field: 'endPoint', value: newEnd }]
  }
}

// ─── Alignment Constraint ─────────────────────────────────────────────────

export class AlignmentConstraint implements IConstraint {
  readonly type = 'alignment'
  constructor(
    public readonly id: string,
    public readonly elementIds: string[],
    public readonly axis: 'x' | 'y',
    public readonly value: number,
  ) {}

  solve(elements: Map<string, IWallElement>): IConstraintMutation[] {
    const mutations: IConstraintMutation[] = []
    for (const eid of this.elementIds) {
      const el = elements.get(eid)
      if (!el) continue
      if (this.axis === 'x') {
        mutations.push({ elementId: eid, field: 'startPoint', value: { ...el.startPoint, x: this.value } })
      } else {
        mutations.push({ elementId: eid, field: 'startPoint', value: { ...el.startPoint, y: this.value } })
      }
    }
    return mutations
  }
}

// ─── Constraint Solver ────────────────────────────────────────────────────

export class ConstraintSolver {
  private constraints: Map<string, IConstraint> = new Map()

  addConstraint(constraint: IConstraint): void {
    this.constraints.set(constraint.id, constraint)
  }

  removeConstraint(id: string): void {
    this.constraints.delete(id)
  }

  removeConstraintsForElement(elementId: string): void {
    for (const [id, constraint] of this.constraints) {
      if (constraint.elementIds.includes(elementId)) {
        this.constraints.delete(id)
      }
    }
  }

  /**
   * Solve all constraints that involve the affected element.
   * Returns a list of mutations to apply to the scene graph.
   */
  solve(
    affectedElementId: string,
    elements: Map<string, IWallElement>
  ): IConstraintMutation[] {
    const results: IConstraintMutation[] = []
    for (const constraint of this.constraints.values()) {
      if (constraint.elementIds.includes(affectedElementId)) {
        results.push(...constraint.solve(elements))
      }
    }
    return results
  }

  get constraintList(): IConstraint[] {
    return Array.from(this.constraints.values())
  }
}

// ─── Template System ────────────────────────────────────────────────────────

import type { ArchitecturalElement } from '../../types/element.types'
import type { IPoint } from '../../types/geometry.types'
import { BatchCommand } from '../history/commands/index'
import { generateId } from '../../utils/id'

export type TemplateCategory = 'residential' | 'commercial' | 'public' | 'interiors'

export interface ITemplateNode {
  type: string
  relX: number   // relative to origin
  relY: number
  properties: Record<string, unknown>
}

export interface ITemplate {
  id: string
  name: string
  version: string
  category: TemplateCategory
  subcategory: string
  tags: string[]
  thumbnail: string
  minWidth: number    // mm
  minHeight: number   // mm
  nodes: ITemplateNode[]
  author: string
  createdAt: string
}

export class TemplateRegistry {
  private static instance: TemplateRegistry
  private templates: Map<string, ITemplate> = new Map()

  static getInstance(): TemplateRegistry {
    if (!this.instance) this.instance = new TemplateRegistry()
    return this.instance
  }

  register(template: ITemplate): void {
    this.templates.set(template.id, template)
  }

  get(id: string): ITemplate | undefined {
    return this.templates.get(id)
  }

  search(query: string, category?: TemplateCategory): ITemplate[] {
    const q = query.toLowerCase()
    return Array.from(this.templates.values()).filter(t => {
      if (category && t.category !== category) return false
      return (
        t.name.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    })
  }

  getByCategory(category: TemplateCategory): ITemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category)
  }

  get all(): ITemplate[] { return Array.from(this.templates.values()) }

  /**
   * Creates a BatchCommand that inserts all template nodes at the given origin.
   * Returns the command — caller dispatches via CommandBus.
   */
  instantiate(templateId: string, origin: IPoint, layerId: string): BatchCommand | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    // Commands would be created here based on template.nodes
    // This returns a BatchCommand wrapping all insertion commands
    return new BatchCommand([], `Insert template: ${template.name}`)
  }
}

export const templateRegistry = TemplateRegistry.getInstance()

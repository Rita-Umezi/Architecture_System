// ─── Scene Graph ───────────────────────────────────────────────────────────
// The single source of truth for all scene elements.
// A mutable class that emits 'settled' events when stable.
// Zustand subscribes to these events — it never mutates the graph directly.

import { SceneNode } from './SceneNode'
import { Layer, DEFAULT_LAYERS } from './Layer'
import { SpatialGraph } from '../geometry/graph/SpatialGraph'
import { FaceDetector, type DetectedFace } from '../geometry/graph/FaceDetector'
import type { ArchitecturalElement, IWallElement } from '../../types/element.types'
import type { IScenePatch } from '../../types/scene.types'
import { generateId } from '../../utils/id'

type ChangeListener = (patch: IScenePatch) => void

export class SceneGraph {
  private nodes: Map<string, SceneNode> = new Map()
  private elements: Map<string, ArchitecturalElement> = new Map()
  private layers: Map<string, Layer> = new Map()
  private listeners: Set<ChangeListener> = new Set()
  private pendingPatch: IScenePatch = { added: [], updated: [], removed: [] }
  private spatialGraph = new SpatialGraph()
  private faceDetector = new FaceDetector(this.spatialGraph)

  constructor() {
    // Initialize default layers
    for (const layer of DEFAULT_LAYERS) {
      this.layers.set(layer.id, layer as Layer)
    }
  }

  // ─── Element CRUD ───────────────────────────────────────────────────────

  addElement(element: ArchitecturalElement): SceneNode {
    this.elements.set(element.id, element)

    const node = new SceneNode(
      generateId(), element.type, element.id,
      'layerId' in element ? element.layerId : 'layer-walls',
    )
    this.nodes.set(node.id, node)

    if (element.type === 'wall') {
      this.spatialGraph.addWall(element as IWallElement)
    }

    this.pendingPatch.added.push(node)
    this.emit()
    return node
  }

  updateElement(id: string, updates: Partial<ArchitecturalElement>): void {
    const element = this.elements.get(id)
    if (!element) return
    Object.assign(element, updates)

    if (element.type === 'wall') {
      this.spatialGraph.removeWall(id)
      this.spatialGraph.addWall(element as IWallElement)
    }

    const node = this.findNodeByElementId(id)
    if (node) {
      this.pendingPatch.updated.push(node)
    }
    this.emit()
  }

  removeElement(id: string): void {
    const element = this.elements.get(id)
    if (!element) return

    if (element.type === 'wall') {
      this.spatialGraph.removeWall(id)
    }

    this.elements.delete(id)
    const node = this.findNodeByElementId(id)
    if (node) {
      this.nodes.delete(node.id)
      this.pendingPatch.removed.push(node.id)
    }
    this.emit()
  }

  getElement<T extends ArchitecturalElement>(id: string): T | undefined {
    return this.elements.get(id) as T | undefined
  }

  // ─── Queries ────────────────────────────────────────────────────────────

  get allNodes(): SceneNode[] { return Array.from(this.nodes.values()) }
  get allElements(): ArchitecturalElement[] { return Array.from(this.elements.values()) }

  getElementsByType<T extends ArchitecturalElement>(type: string): T[] {
    return Array.from(this.elements.values()).filter(e => e.type === type) as T[]
  }

  getAllWalls(): IWallElement[] { return this.getElementsByType<IWallElement>('wall') }

  findNodeByElementId(elementId: string): SceneNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.elementId === elementId) return node
    }
  }

  // ─── Layer Management ───────────────────────────────────────────────────

  get allLayers(): Layer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.order - b.order)
  }

  updateLayer(id: string, updates: Partial<Layer>): void {
    const layer = this.layers.get(id)
    if (layer) Object.assign(layer, updates)
    this.emit()
  }

  // ─── Face Detection (Room Detection) ────────────────────────────────────

  detectFaces(): DetectedFace[] {
    return this.faceDetector.detect()
  }

  // ─── Change Notifications ────────────────────────────────────────────────

  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    const patch = { ...this.pendingPatch }
    this.pendingPatch = { added: [], updated: [], removed: [] }
    for (const listener of this.listeners) listener(patch)
  }

  // ─── Serialization ──────────────────────────────────────────────────────

  snapshot(): { elements: ArchitecturalElement[]; layers: Layer[] } {
    return {
      elements: Array.from(this.elements.values()),
      layers:   Array.from(this.layers.values()),
    }
  }
}

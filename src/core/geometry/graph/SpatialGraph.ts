// ─── Spatial Graph ─────────────────────────────────────────────────────────
// A graph of wall segments and their connection topology.
// Used by FaceDetector to discover room polygons.

import type { IWallElement } from '../../../types/element.types'
import type { IPoint } from '../../../types/geometry.types'
import { Point } from '../primitives/Point'

export interface GraphNode {
  id: string
  point: Point
  connectedWallIds: Set<string>
}

export interface GraphEdge {
  wallId: string
  from: string    // node id
  to: string      // node id
}

const ENDPOINT_MERGE_DIST = 5  // mm — snap radius for node merging

export class SpatialGraph {
  private nodes: Map<string, GraphNode> = new Map()
  private edges: Map<string, GraphEdge> = new Map()
  private nodeCounter = 0

  /** Rebuild entire graph from a wall list */
  rebuild(walls: IWallElement[]): void {
    this.nodes.clear()
    this.edges.clear()
    for (const wall of walls) {
      this.addWall(wall)
    }
  }

  addWall(wall: IWallElement): void {
    const fromNode = this.mergeOrCreateNode(wall.startPoint)
    const toNode   = this.mergeOrCreateNode(wall.endPoint)
    fromNode.connectedWallIds.add(wall.id)
    toNode.connectedWallIds.add(wall.id)
    this.edges.set(wall.id, { wallId: wall.id, from: fromNode.id, to: toNode.id })
  }

  removeWall(wallId: string): void {
    const edge = this.edges.get(wallId)
    if (!edge) return
    const fromNode = this.nodes.get(edge.from)
    const toNode   = this.nodes.get(edge.to)
    fromNode?.connectedWallIds.delete(wallId)
    toNode?.connectedWallIds.delete(wallId)
    this.edges.delete(wallId)
    // Prune isolated nodes
    if (fromNode?.connectedWallIds.size === 0) this.nodes.delete(edge.from)
    if (toNode?.connectedWallIds.size === 0)   this.nodes.delete(edge.to)
  }

  getEdge(wallId: string): GraphEdge | undefined { return this.edges.get(wallId) }
  getNode(nodeId: string): GraphNode | undefined { return this.nodes.get(nodeId) }
  get allNodes(): GraphNode[] { return Array.from(this.nodes.values()) }
  get allEdges(): GraphEdge[] { return Array.from(this.edges.values()) }

  private mergeOrCreateNode(point: IPoint): GraphNode {
    for (const node of this.nodes.values()) {
      if (node.point.distanceTo(point) < ENDPOINT_MERGE_DIST) return node
    }
    const id = `n${this.nodeCounter++}`
    const node: GraphNode = { id, point: Point.from(point), connectedWallIds: new Set() }
    this.nodes.set(id, node)
    return node
  }
}

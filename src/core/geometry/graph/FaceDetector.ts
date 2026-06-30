// ─── Face Detector ─────────────────────────────────────────────────────────
// Detects closed regions (rooms) in the wall graph using a planar face
// traversal algorithm (half-edge / next-clockwise traversal).

import { SpatialGraph, type GraphNode } from './SpatialGraph'
import { Polygon } from '../primitives/Polygon'

export interface DetectedFace {
  boundaryWallIds: string[]
  polygon: Polygon
}

export class FaceDetector {
  constructor(private graph: SpatialGraph) {}

  /** Find all minimal closed regions in the current graph */
  detect(): DetectedFace[] {
    const faces: DetectedFace[] = []
    const visitedEdgePairs = new Set<string>()

    for (const edge of this.graph.allEdges) {
      for (const [from, to] of [[edge.from, edge.to], [edge.to, edge.from]]) {
        const key = `${from}->${to}-${edge.wallId}`
        if (visitedEdgePairs.has(key)) continue

        const face = this.traverseFace(from, to, edge.wallId, visitedEdgePairs)
        if (face && face.polygon.vertices.length >= 3 && face.polygon.area > 10_000) {
          faces.push(face)
        }
      }
    }

    return faces
  }

  private traverseFace(
    startFrom: string,
    startTo: string,
    startWallId: string,
    visited: Set<string>
  ): DetectedFace | null {
    const wallIds: string[] = []
    const points = []

    let currentFrom = startFrom
    let currentTo   = startTo
    let currentWall = startWallId

    const MAX_STEPS = 64

    for (let step = 0; step < MAX_STEPS; step++) {
      const key = `${currentFrom}->${currentTo}-${currentWall}`
      if (visited.has(key)) {
        if (step > 0 && currentTo === startFrom) {
          wallIds.push(currentWall)
          const toNode = this.graph.getNode(currentTo)
          if (toNode) points.push(toNode.point)
          // Mark all traversed pairs
          this.markFaceEdges(startFrom, startTo, startWallId, wallIds, visited)
          return { boundaryWallIds: wallIds, polygon: Polygon.fromPoints(points) }
        }
        return null
      }

      visited.add(key)
      wallIds.push(currentWall)
      const toNode = this.graph.getNode(currentTo)
      if (!toNode) return null
      points.push(toNode.point)

      const next = this.nextClockwise(currentFrom, currentTo, toNode)
      if (!next) return null

      currentFrom = currentTo
      currentTo   = next.toNodeId
      currentWall = next.wallId

      if (currentFrom === startFrom && next.wallId === startWallId) break
    }

    return null
  }

  private nextClockwise(
    prevNodeId: string,
    currNodeId: string,
    currNode: GraphNode
  ): { wallId: string; toNodeId: string } | null {
    const prevNode = this.graph.getNode(prevNodeId)
    if (!prevNode) return null

    const inAngle = Math.atan2(
      currNode.point.y - prevNode.point.y,
      currNode.point.x - prevNode.point.x
    )

    let bestAngle = Infinity
    let bestEdge: { wallId: string; toNodeId: string } | null = null

    for (const wallId of currNode.connectedWallIds) {
      const edge = this.graph.getEdge(wallId)
      if (!edge) continue

      const neighborId = edge.from === currNodeId ? edge.to : edge.from
      if (neighborId === prevNodeId) continue

      const neighborNode = this.graph.getNode(neighborId)
      if (!neighborNode) continue

      const outAngle = Math.atan2(
        neighborNode.point.y - currNode.point.y,
        neighborNode.point.x - currNode.point.x
      )

      let relAngle = outAngle - inAngle - Math.PI
      while (relAngle > Math.PI)  relAngle -= 2 * Math.PI
      while (relAngle < -Math.PI) relAngle += 2 * Math.PI

      if (relAngle < bestAngle) {
        bestAngle = relAngle
        bestEdge = { wallId, toNodeId: neighborId }
      }
    }

    return bestEdge
  }

  private markFaceEdges(
    startFrom: string, startTo: string, startWall: string,
    wallIds: string[], visited: Set<string>
  ): void {
    // Already marked during traversal
  }
}

// ─── Adjacency Map ─────────────────────────────────────────────────────────
// Maps room adjacency — which rooms share walls.

export interface RoomAdjacency {
  roomIdA: string
  roomIdB: string
  sharedWallIds: string[]
}

export class AdjacencyMap {
  private adjacencies: Map<string, RoomAdjacency> = new Map()

  private key(a: string, b: string): string {
    return [a, b].sort().join(':')
  }

  addSharedWall(roomA: string, roomB: string, wallId: string): void {
    const k = this.key(roomA, roomB)
    const existing = this.adjacencies.get(k)
    if (existing) {
      if (!existing.sharedWallIds.includes(wallId)) {
        existing.sharedWallIds.push(wallId)
      }
    } else {
      this.adjacencies.set(k, { roomIdA: roomA, roomIdB: roomB, sharedWallIds: [wallId] })
    }
  }

  getAdjacent(roomId: string): RoomAdjacency[] {
    return Array.from(this.adjacencies.values()).filter(
      a => a.roomIdA === roomId || a.roomIdB === roomId
    )
  }

  areAdjacent(roomA: string, roomB: string): boolean {
    return this.adjacencies.has(this.key(roomA, roomB))
  }

  rebuild(roomWallMap: Map<string, string[]>): void {
    this.adjacencies.clear()
    const rooms = Array.from(roomWallMap.entries())
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const [idA, wallsA] = rooms[i]
        const [idB, wallsB] = rooms[j]
        const shared = wallsA.filter(w => wallsB.includes(w))
        for (const wallId of shared) {
          this.addSharedWall(idA, idB, wallId)
        }
      }
    }
  }
}

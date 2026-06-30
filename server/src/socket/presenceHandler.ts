// ─── Presence Socket Handler ───────────────────────────────────────────────

import type { Server, Socket } from 'socket.io'
import { WEBSOCKET_EVENTS } from '../../../../shared/constants'

interface PresencePeer {
  userId: string
  socketId: string
  name?: string
  color: string
  cursorX?: number
  cursorY?: number
  activeFloorId?: string
  lastSeen: string
}

const PRESENCE_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#f43f5e','#8b5cf6','#84cc16']
const projectRooms = new Map<string, Map<string, PresencePeer>>()

function getOrCreateRoom(projectId: string): Map<string, PresencePeer> {
  if (!projectRooms.has(projectId)) projectRooms.set(projectId, new Map())
  return projectRooms.get(projectId)!
}

function getColor(room: Map<string, PresencePeer>, userId: string): string {
  const idx = room.size % PRESENCE_COLORS.length
  return PRESENCE_COLORS[idx]
}

export function registerPresenceHandlers(io: Server, socket: Socket): void {
  const userId = (socket as any).userId as string

  socket.on(WEBSOCKET_EVENTS.JOIN_PROJECT, ({ projectId }: { projectId: string }) => {
    socket.join(`project:${projectId}`)
    const room = getOrCreateRoom(projectId)
    const color = getColor(room, userId)
    room.set(socket.id, { userId, socketId: socket.id, color, lastSeen: new Date().toISOString() })

    // Broadcast updated presence to everyone in room
    io.to(`project:${projectId}`).emit(
      WEBSOCKET_EVENTS.PRESENCE_UPDATE,
      Array.from(room.values())
    )
    ;(socket as any)._projectId = projectId
  })

  socket.on(WEBSOCKET_EVENTS.CURSOR_MOVE, ({ x, y, floorId }: { x: number; y: number; floorId: string }) => {
    const projectId = (socket as any)._projectId as string
    if (!projectId) return
    const room = getOrCreateRoom(projectId)
    const peer = room.get(socket.id)
    if (peer) {
      peer.cursorX = x; peer.cursorY = y; peer.activeFloorId = floorId
      peer.lastSeen = new Date().toISOString()
    }
    // Broadcast cursor only to others (not self)
    socket.to(`project:${projectId}`).emit(WEBSOCKET_EVENTS.CURSOR_MOVE, { userId, x, y, floorId })
  })

  socket.on('disconnect', () => {
    const projectId = (socket as any)._projectId as string
    if (!projectId) return
    const room = getOrCreateRoom(projectId)
    room.delete(socket.id)
    if (room.size === 0) {
      projectRooms.delete(projectId)
    } else {
      io.to(`project:${projectId}`).emit(WEBSOCKET_EVENTS.PRESENCE_UPDATE, Array.from(room.values()))
    }
  })
}

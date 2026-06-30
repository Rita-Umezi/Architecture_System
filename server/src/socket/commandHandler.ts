// ─── Command Socket Handler ────────────────────────────────────────────────
// Forwards validated commands to all peers in the project room.
// The server is a relay — it does NOT execute commands on a server scene graph.

import type { Server, Socket } from 'socket.io'
import { WEBSOCKET_EVENTS } from '../../../../shared/constants'
import { SceneDataModel } from '../models/index'

interface RemoteCommand {
  commandType: string
  payload: unknown
  projectId: string
  floorId: string
}

export function registerCommandHandlers(io: Server, socket: Socket): void {
  const userId = (socket as any).userId as string

  socket.on(WEBSOCKET_EVENTS.COMMAND, async (data: RemoteCommand) => {
    const { commandType, payload, projectId, floorId } = data

    // Broadcast to everyone else in the room
    socket.to(`project:${projectId}`).emit(WEBSOCKET_EVENTS.COMMAND, {
      commandType, payload, floorId, userId,
      timestamp: new Date().toISOString(),
    })

    // Persist scene snapshot if provided
    if (commandType === 'scene:snapshot' && Array.isArray(payload)) {
      try {
        await SceneDataModel.findOneAndUpdate(
          { projectId, floorId },
          { $set: { elements: payload, version: Date.now() } },
          { upsert: true }
        )
      } catch (err) {
        console.error('[CommandHandler] Scene persist error:', err)
      }
    }
  })
}

// ─── Realtime / Collaboration Service ──────────────────────────────────────
// Wraps socket.io-client for real-time multiplayer sync.

import { io, Socket } from 'socket.io-client'
import { WEBSOCKET_EVENTS } from '../../../shared/constants'
import { useCollaborationStore } from '../../store/index'
import type { IPresenceUser } from '../../types/api.types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001'

class RealtimeService {
  private socket: Socket | null = null
  private projectId: string | null = null

  connect(token: string): void {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      useCollaborationStore.getState().setConnected(true)
      if (this.projectId) this.joinProject(this.projectId)
    })

    this.socket.on('disconnect', () => {
      useCollaborationStore.getState().setConnected(false)
    })

    this.socket.on(WEBSOCKET_EVENTS.PRESENCE_UPDATE, (peers: IPresenceUser[]) => {
      useCollaborationStore.getState().setPeers(peers)
    })

    this.socket.on(WEBSOCKET_EVENTS.CONFLICT, () => {
      useCollaborationStore.getState().setConflict(true)
    })

    this.socket.on(WEBSOCKET_EVENTS.ERROR, (err: { message: string }) => {
      console.error('[Realtime] Server error:', err.message)
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.projectId = null
    useCollaborationStore.getState().setConnected(false)
    useCollaborationStore.getState().setPeers([])
  }

  joinProject(projectId: string): void {
    this.projectId = projectId
    this.socket?.emit(WEBSOCKET_EVENTS.JOIN_PROJECT, { projectId })
  }

  leaveProject(): void {
    if (this.projectId) {
      this.socket?.emit(WEBSOCKET_EVENTS.LEAVE_PROJECT, { projectId: this.projectId })
      this.projectId = null
    }
  }

  sendCommand(commandType: string, payload: unknown): void {
    this.socket?.emit(WEBSOCKET_EVENTS.COMMAND, { commandType, payload })
  }

  sendCursorMove(x: number, y: number, floorId: string): void {
    this.socket?.emit(WEBSOCKET_EVENTS.CURSOR_MOVE, { x, y, floorId })
  }

  onRemoteCommand(handler: (data: { commandType: string; payload: unknown; userId: string }) => void): () => void {
    this.socket?.on(WEBSOCKET_EVENTS.COMMAND, handler)
    return () => { this.socket?.off(WEBSOCKET_EVENTS.COMMAND, handler) }
  }

  get isConnected(): boolean { return this.socket?.connected ?? false }
}

export const realtimeService = new RealtimeService()

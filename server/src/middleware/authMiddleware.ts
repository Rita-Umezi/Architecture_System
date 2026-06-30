// ─── Auth Middleware ───────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express'
import type { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-key'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticateHttp(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  try {
    const token   = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId    = payload.userId
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

export function authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token as string
  if (!token) { next(new Error('Unauthorized')); return }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    ;(socket as any).userId = payload.userId
    next()
  } catch {
    next(new Error('Invalid token'))
  }
}

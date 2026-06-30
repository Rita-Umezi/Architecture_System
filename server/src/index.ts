// ─── Server Entry Point ────────────────────────────────────────────────────

import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'

// Routes
import { authRouter }    from './routes/auth'
import { projectRouter } from './routes/projects'
import { assetRouter }   from './routes/assets'

// Socket handlers
import { registerPresenceHandlers } from './socket/presenceHandler'
import { registerCommandHandlers }  from './socket/commandHandler'

// Middleware
import { authenticateSocket } from './middleware/authMiddleware'

const PORT       = parseInt(process.env.PORT ?? '3001')
const MONGO_URI  = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/buildflow'
const CLIENT_URL = process.env.CLIENT_URL  ?? 'http://localhost:5173'

// ─── Express Setup ─────────────────────────────────────────────────────────

const app = express()

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }))

// API Routes
app.use('/api/auth',     authRouter)
app.use('/api/projects', projectRouter)
app.use('/api/assets',   assetRouter)

// ─── HTTP + Socket.IO Setup ────────────────────────────────────────────────

const httpServer = createServer(app)

const io = new SocketIO(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
})

// Socket auth middleware
io.use(authenticateSocket)

// Register socket event handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)
  registerPresenceHandlers(io, socket)
  registerCommandHandlers(io, socket)
  socket.on('disconnect', () => console.log(`[Socket] Client disconnected: ${socket.id}`))
})

// ─── Database + Start ──────────────────────────────────────────────────────

async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('[DB] Connected to MongoDB')

    httpServer.listen(PORT, () => {
      console.log(`[Server] BuildFlow API running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[Server] Startup error:', err)
    process.exit(1)
  }
}

start()

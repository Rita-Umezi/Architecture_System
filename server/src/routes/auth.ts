// ─── Auth Routes ───────────────────────────────────────────────────────────

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { UserModel } from '../models/index'

export const authRouter = Router()

const JWT_SECRET     = process.env.JWT_SECRET     ?? 'dev-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any)
}

// ─── Register ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
})

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }
  const { name, email, password } = parsed.data
  const existing = await UserModel.findOne({ email })
  if (existing) { res.status(409).json({ success: false, error: 'Email already registered' }); return }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await UserModel.create({ name, email, passwordHash })
  const token = signToken(user._id.toString())
  res.status(201).json({ success: true, data: { accessToken: token, userId: user._id } })
})

// ─── Login ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ success: false, error: 'Invalid input' }); return }

  const { email, password } = parsed.data
  const user = await UserModel.findOne({ email })
  if (!user) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return }

  const token = signToken(user._id.toString())
  res.json({ success: true, data: { accessToken: token, userId: user._id, name: user.name, email: user.email } })
})

// ─── Logout ───────────────────────────────────────────────────────────────

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out' })
})

// ─── Me ───────────────────────────────────────────────────────────────────

authRouter.get('/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ success: false, error: 'Unauthorized' }); return }
  try {
    const { userId } = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string }
    const user = await UserModel.findById(userId).select('-passwordHash')
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return }
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email } })
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
})

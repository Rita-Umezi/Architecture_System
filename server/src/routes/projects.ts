// ─── Project Routes ────────────────────────────────────────────────────────

import { Router } from 'express'
import { z } from 'zod'
import { ProjectModel, SceneDataModel } from '../models/index'
import { authenticateHttp, type AuthRequest } from '../middleware/authMiddleware'

export const projectRouter = Router()
projectRouter.use(authenticateHttp)

// Helper
function uid() {
  // Simple ID generator for server side
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── List Projects ─────────────────────────────────────────────────────────

projectRouter.get('/', async (req: AuthRequest, res) => {
  const projects = await ProjectModel.find({
    $or: [{ ownerId: req.userId }, { collaboratorIds: req.userId }]
  }).select('name description thumbnail tags updatedAt')
  res.json({ success: true, data: { items: projects, total: projects.length } })
})

// ─── Get Project ───────────────────────────────────────────────────────────

projectRouter.get('/:id', async (req: AuthRequest, res) => {
  const project = await ProjectModel.findOne({
    _id: req.params.id,
    $or: [{ ownerId: req.userId }, { collaboratorIds: req.userId }]
  })
  if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return }
  res.json({ success: true, data: project })
})

// ─── Create Project ────────────────────────────────────────────────────────

const createSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags:        z.array(z.string()).default([]),
})

projectRouter.post('/', async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.issues[0]?.message }); return }

  const floorId = uid()
  const project = await ProjectModel.create({
    ...parsed.data,
    ownerId: req.userId,
    floors: [{ id: floorId, name: 'Ground Floor', level: 0, floorHeight: 3000, sceneGraphId: uid() }],
    activeFloorId: floorId,
    schemaVersion: 1,
  })
  res.status(201).json({ success: true, data: project })
})

// ─── Update Project ────────────────────────────────────────────────────────

projectRouter.put('/:id', async (req: AuthRequest, res) => {
  const project = await ProjectModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.userId },
    { $set: req.body },
    { new: true }
  )
  if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return }
  res.json({ success: true, data: project })
})

// ─── Delete Project ────────────────────────────────────────────────────────

projectRouter.delete('/:id', async (req: AuthRequest, res) => {
  await ProjectModel.deleteOne({ _id: req.params.id, ownerId: req.userId })
  await SceneDataModel.deleteMany({ projectId: req.params.id })
  res.json({ success: true, message: 'Deleted' })
})

// ─── Scene Data ────────────────────────────────────────────────────────────

projectRouter.get('/:id/floors/:floorId/scene', async (req, res) => {
  const scene = await SceneDataModel.findOne({ projectId: req.params.id, floorId: req.params.floorId })
  res.json({ success: true, data: { elements: scene?.elements ?? [] } })
})

projectRouter.post('/:id/floors/:floorId/scene', async (req, res) => {
  const { elements } = req.body
  await SceneDataModel.findOneAndUpdate(
    { projectId: req.params.id, floorId: req.params.floorId },
    { $set: { elements, version: 1 } },
    { upsert: true, new: true }
  )
  res.json({ success: true, message: 'Scene saved' })
})

// ─── Asset Routes ──────────────────────────────────────────────────────────

import { Router } from 'express'

export const assetRouter = Router()

// Placeholder asset listing — future: serve from S3/CDN
assetRouter.get('/', async (req, res) => {
  const { category, q = '', page = 1, limit = 24 } = req.query
  // TODO: Wire to MongoDB AssetModel when assets are indexed
  res.json({
    success: true,
    data: { items: [], total: 0, page: Number(page), pageSize: Number(limit) }
  })
})

assetRouter.get('/:id', async (req, res) => {
  res.status(404).json({ success: false, error: 'Asset not found' })
})

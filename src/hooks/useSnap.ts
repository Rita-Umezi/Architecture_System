// ─── useSnap Hook ──────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { useSnapStore, sceneGraph } from '../store/index'
import { snapManager } from '../core/snapping/SnapManager'
import type { IPoint } from '../types/geometry.types'
import type { ISnapResult } from '../types/snap.types'

export function useSnap() {
  const { settings, guides, updateSettings, addGuide, removeGuide } = useSnapStore()

  const resolve = useCallback((raw: IPoint, drawOrigin?: IPoint): ISnapResult => {
    const walls = sceneGraph.getAllWalls()
    return snapManager.resolve(raw, walls, settings, guides, drawOrigin)
  }, [settings, guides])

  return { settings, guides, resolve, updateSettings, addGuide, removeGuide }
}

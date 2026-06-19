// ─── All Zustand Stores ────────────────────────────────────────────────────
// Each store is a focused slice. No store contains geometry data.

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { SceneGraph } from '../core/scene/SceneGraph'
import { CommandBus } from '../core/history/CommandBus'
import { DEFAULT_LAYERS } from '../core/scene/Layer'
import type { IProject, IFloor } from '../types/project.types'
import type { IScenePatch, ILayer, IViewport } from '../types/scene.types'
import type { ISnapSettings, IGuide } from '../types/snap.types'
import type { MeasurementDisplayMode, UnitSystem } from '../types/measurement.types'
import type { IAITask } from '../types/ai.types'
import type { IPresenceUser } from '../types/api.types'
import { generateId } from '../utils/id'

// ─── Shared singletons (created once, held outside React) ─────────────────

export const sceneGraph = new SceneGraph()
export const commandBus = new CommandBus(sceneGraph)

// ─── useSceneStore ─────────────────────────────────────────────────────────

interface SceneState {
  version: number           // increments on every scene change
  layers: ILayer[]
  nodeCount: number
  bump: () => void          // called by SceneGraph listener
}

export const useSceneStore = create<SceneState>()(devtools((set) => {
  // Subscribe to scene changes
  sceneGraph.subscribe((_patch: IScenePatch) => {
    useSceneStore.getState().bump()
  })

  return {
    version: 0,
    layers: DEFAULT_LAYERS,
    nodeCount: 0,
    bump: () => set(s => ({
      version: s.version + 1,
      layers: sceneGraph.allLayers,
      nodeCount: sceneGraph.allNodes.length,
    })),
  }
}, { name: 'SceneStore' }))

// ─── useProjectStore ───────────────────────────────────────────────────────

interface ProjectState {
  project: IProject | null
  floors: IFloor[]
  activeFloorId: string | null
  setProject: (project: IProject) => void
  setActiveFloor: (floorId: string) => void
}

export const useProjectStore = create<ProjectState>()(devtools((set) => ({
  project: null,
  floors: [],
  activeFloorId: null,
  setProject: (project) => set({ project, floors: project.floors, activeFloorId: project.activeFloorId }),
  setActiveFloor: (floorId) => set({ activeFloorId: floorId }),
}), { name: 'ProjectStore' }))

// ─── useSelectionStore ─────────────────────────────────────────────────────

interface SelectionState {
  selectedIds: Set<string>
  hoveredId: string | null
  select: (id: string, multi?: boolean) => void
  deselect: (id: string) => void
  clearSelection: () => void
  setHovered: (id: string | null) => void
}

export const useSelectionStore = create<SelectionState>()(devtools((set) => ({
  selectedIds: new Set(),
  hoveredId: null,
  select: (id, multi = false) => set(s => ({
    selectedIds: multi ? new Set([...s.selectedIds, id]) : new Set([id]),
  })),
  deselect: (id) => set(s => {
    const next = new Set(s.selectedIds)
    next.delete(id)
    return { selectedIds: next }
  }),
  clearSelection: () => set({ selectedIds: new Set() }),
  setHovered: (id) => set({ hoveredId: id }),
}), { name: 'SelectionStore' }))

// ─── useToolStore ──────────────────────────────────────────────────────────

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'room' | 'stair' | 'column' | 'measure' | 'pan'

interface ToolState {
  activeTool: ToolType
  toolOptions: Record<string, unknown>
  setTool: (tool: ToolType) => void
  setToolOption: (key: string, value: unknown) => void
}

export const useToolStore = create<ToolState>()(devtools((set) => ({
  activeTool: 'select',
  toolOptions: { wallThickness: 200, wallHeight: 2700 },
  setTool: (tool) => set({ activeTool: tool }),
  setToolOption: (key, value) => set(s => ({
    toolOptions: { ...s.toolOptions, [key]: value }
  })),
}), { name: 'ToolStore' }))

// ─── useViewStore ──────────────────────────────────────────────────────────

interface ViewState {
  mode: '2d' | '3d'
  zoom: number
  panX: number
  panY: number
  setMode: (mode: '2d' | '3d') => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  fitToScreen: () => void
}

export const useViewStore = create<ViewState>()(devtools((set) => ({
  mode: '2d',
  zoom: 1,
  panX: 0,
  panY: 0,
  setMode: (mode) => set({ mode }),
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(10, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  fitToScreen: () => set({ zoom: 1, panX: 0, panY: 0 }),
}), { name: 'ViewStore' }))

// ─── useHistoryStore ───────────────────────────────────────────────────────

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  undoDepth: number
  undo: () => void
  redo: () => void
  _sync: () => void
}

export const useHistoryStore = create<HistoryState>()(devtools((set) => {
  commandBus.subscribe(() => {
    useHistoryStore.getState()._sync()
  })

  return {
    canUndo: false,
    canRedo: false,
    undoDepth: 0,
    undo: () => { commandBus.undo(); useHistoryStore.getState()._sync() },
    redo: () => { commandBus.redo(); useHistoryStore.getState()._sync() },
    _sync: () => set({
      canUndo: commandBus.canUndo,
      canRedo: commandBus.canRedo,
      undoDepth: commandBus.undoDepth,
    }),
  }
}, { name: 'HistoryStore' }))

// ─── useSnapStore ──────────────────────────────────────────────────────────

interface SnapState {
  settings: ISnapSettings
  guides: IGuide[]
  updateSettings: (patch: Partial<ISnapSettings>) => void
  addGuide: (guide: Omit<IGuide, 'id'>) => void
  removeGuide: (id: string) => void
}

const DEFAULT_SNAP: ISnapSettings = {
  gridEnabled: true, wallEndpointEnabled: true,
  wallMidpointEnabled: true, angleEnabled: true,
  guideEnabled: true, intersectionEnabled: false,
  gridSize: 100, snapRadius: 20, angleIncrement: 45,
}

export const useSnapStore = create<SnapState>()(devtools((set) => ({
  settings: DEFAULT_SNAP,
  guides: [],
  updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
  addGuide: (guide) => set(s => ({ guides: [...s.guides, { ...guide, id: generateId() }] })),
  removeGuide: (id) => set(s => ({ guides: s.guides.filter(g => g.id !== id) })),
}), { name: 'SnapStore' }))

// ─── useMeasurementStore ───────────────────────────────────────────────────

interface MeasurementState {
  displayMode: MeasurementDisplayMode
  unitSystem: UnitSystem
  annotationsVisible: boolean
  setDisplayMode: (mode: MeasurementDisplayMode) => void
  setUnitSystem: (system: UnitSystem) => void
  toggleAnnotations: () => void
}

export const useMeasurementStore = create<MeasurementState>()(devtools((set) => ({
  displayMode: 'auto',
  unitSystem: 'metric',
  annotationsVisible: true,
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setUnitSystem: (unitSystem) => set({ unitSystem }),
  toggleAnnotations: () => set(s => ({ annotationsVisible: !s.annotationsVisible })),
}), { name: 'MeasurementStore' }))

// ─── useCollaborationStore ─────────────────────────────────────────────────

interface CollaborationState {
  peers: IPresenceUser[]
  isConnected: boolean
  hasConflict: boolean
  setPeers: (peers: IPresenceUser[]) => void
  setConnected: (v: boolean) => void
  setConflict: (v: boolean) => void
}

export const useCollaborationStore = create<CollaborationState>()(devtools((set) => ({
  peers: [],
  isConnected: false,
  hasConflict: false,
  setPeers: (peers) => set({ peers }),
  setConnected: (isConnected) => set({ isConnected }),
  setConflict: (hasConflict) => set({ hasConflict }),
}), { name: 'CollaborationStore' }))

// ─── useAIStore ────────────────────────────────────────────────────────────

interface AIState {
  activeTask: IAITask | null
  lastResult: IAITask | null
  error: string | null
  setActiveTask: (task: IAITask | null) => void
  setLastResult: (task: IAITask) => void
  setError: (error: string | null) => void
}

export const useAIStore = create<AIState>()(devtools((set) => ({
  activeTask: null,
  lastResult: null,
  error: null,
  setActiveTask: (activeTask) => set({ activeTask }),
  setLastResult: (lastResult) => set({ lastResult }),
  setError: (error) => set({ error }),
}), { name: 'AIStore' }))

// ─── useUIStore ────────────────────────────────────────────────────────────

interface UIState {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  layersPanelOpen: boolean
  templateLibraryOpen: boolean
  aiPanelOpen: boolean
  exportPanelOpen: boolean
  activeModal: string | null
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleLayersPanel: () => void
  toggleTemplateLibrary: () => void
  toggleAIPanel: () => void
  toggleExportPanel: () => void
  openModal: (name: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(devtools((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  layersPanelOpen: false,
  templateLibraryOpen: false,
  aiPanelOpen: false,
  exportPanelOpen: false,
  activeModal: null,
  toggleLeftPanel:       () => set(s => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel:      () => set(s => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleLayersPanel:     () => set(s => ({ layersPanelOpen: !s.layersPanelOpen })),
  toggleTemplateLibrary: () => set(s => ({ templateLibraryOpen: !s.templateLibraryOpen })),
  toggleAIPanel:         () => set(s => ({ aiPanelOpen: !s.aiPanelOpen })),
  toggleExportPanel:     () => set(s => ({ exportPanelOpen: !s.exportPanelOpen })),
  openModal:  (name) => set({ activeModal: name }),
  closeModal: ()     => set({ activeModal: null }),
}), { name: 'UIStore' }))

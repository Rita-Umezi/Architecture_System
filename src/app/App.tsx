import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import {
  useToolStore, useSceneStore, useSelectionStore,
  useViewStore, useSnapStore, useHistoryStore,
  useUIStore, useMeasurementStore, sceneGraph, commandBus
} from '../store/index'
import { AddWallCommand, DeleteElementCommand } from '../core/history/commands/index'
import { snapManager } from '../core/snapping/SnapManager'
import type { IPoint } from '../types/geometry.types'
import type { IWallElement } from '../types/element.types'
import { wallOffsetPolygon } from '../core/geometry/operations/Offset'
import { Segment } from '../core/geometry/primitives/Segment'
import { Point } from '../core/geometry/primitives/Point'
import { getRoomColor } from '../utils/colors'
import { formatLength } from '../utils/units'
import { useShortcuts } from '../hooks/useShortcuts'
import { useCommand } from '../hooks/useCommand'

// ─── Toolbar ──────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'select', icon: '↖', label: 'Select (V)' },
  { id: 'wall',   icon: '▭', label: 'Wall (W)' },
  { id: 'door',   icon: '⌐', label: 'Door (D)' },
  { id: 'window', icon: '⊟', label: 'Window (N)' },
  { id: 'stair',  icon: '≡', label: 'Stair' },
  { id: 'measure',icon: '⊷', label: 'Measure' },
  { id: 'pan',    icon: '✥', label: 'Pan (P)' },
] as const

function Toolbar() {
  const { activeTool, setTool } = useToolStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { setMode, mode } = useViewStore()
  const { toggleTemplateLibrary, toggleLayersPanel, toggleAIPanel, toggleExportPanel } = useUIStore()

  return (
    <div className="glass-panel flex flex-col gap-1 p-2 rounded-xl w-14 animate-slide-in-left z-10">
      {/* Logo */}
      <div className="flex items-center justify-center h-10 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-glow-primary">
          B
        </div>
      </div>

      {/* Drawing tools */}
      <div className="flex flex-col gap-0.5">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            id={`tool-${tool.id}`}
            title={tool.label}
            className={`tool-btn text-lg ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setTool(tool.id as any)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="border-t border-surface-700 my-1" />

      {/* Undo/Redo */}
      <button
        title="Undo (Ctrl+Z)" id="btn-undo"
        className={`tool-btn text-sm ${!canUndo ? 'opacity-30' : ''}`}
        onClick={undo} disabled={!canUndo}
      >↩</button>
      <button
        title="Redo (Ctrl+Y)" id="btn-redo"
        className={`tool-btn text-sm ${!canRedo ? 'opacity-30' : ''}`}
        onClick={redo} disabled={!canRedo}
      >↪</button>

      <div className="border-t border-surface-700 my-1" />

      {/* View toggles */}
      <button
        title="Toggle 3D (3)" id="btn-toggle-3d"
        className={`tool-btn text-xs font-bold ${mode === '3d' ? 'active' : ''}`}
        onClick={() => setMode(mode === '2d' ? '3d' : '2d')}
      >
        {mode === '2d' ? '3D' : '2D'}
      </button>
      <button title="Templates" id="btn-templates" className="tool-btn text-sm" onClick={toggleTemplateLibrary}>⊞</button>
      <button title="Layers"    id="btn-layers"    className="tool-btn text-sm" onClick={toggleLayersPanel}>⊟</button>
      <button title="AI"        id="btn-ai"        className="tool-btn text-sm" onClick={toggleAIPanel}>✦</button>
      <button title="Export"    id="btn-export"    className="tool-btn text-sm" onClick={toggleExportPanel}>⤓</button>
    </div>
  )
}

// ─── Properties Panel ─────────────────────────────────────────────────────

function PropertiesPanel() {
  const { selectedIds } = useSelectionStore()
  const { version } = useSceneStore()
  const { dispatch } = useCommand()
  const { unitSystem } = useMeasurementStore()

  const selectedId = selectedIds.size === 1 ? [...selectedIds][0] : null
  const selectedNode = selectedId ? sceneGraph.findNodeByElementId(selectedId) : null
  const element = selectedNode ? sceneGraph.getElement(selectedNode.elementId) : null

  if (!element) {
    return (
      <div className="glass-panel rounded-xl w-64 p-4 animate-slide-in-right z-10">
        <p className="panel-section-header">Properties</p>
        <p className="text-surface-500 text-xs px-3 py-4 text-center">
          Select an element to view its properties
        </p>
        {/* Quick stats */}
        <div className="border-t border-surface-700 mt-2 pt-3 px-3">
          <p className="panel-section-header">Scene</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-800 rounded-md p-2">
              <div className="text-surface-400">Walls</div>
              <div className="text-white font-semibold text-base">
                {sceneGraph.getElementsByType('wall').length}
              </div>
            </div>
            <div className="bg-surface-800 rounded-md p-2">
              <div className="text-surface-400">Elements</div>
              <div className="text-white font-semibold text-base">
                {sceneGraph.allElements.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl w-64 overflow-y-auto max-h-full styled-scrollbar animate-slide-in-right z-10">
      <p className="panel-section-header">
        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties
      </p>

      {'startPoint' in element && 'endPoint' in element && (
        <div className="px-3 pb-3 space-y-2">
          <div>
            <label className="text-2xs text-surface-400 uppercase tracking-wider block mb-1">Start X</label>
            <input className="prop-input" type="number" value={Math.round((element as IWallElement).startPoint.x)} readOnly />
          </div>
          <div>
            <label className="text-2xs text-surface-400 uppercase tracking-wider block mb-1">Start Y</label>
            <input className="prop-input" type="number" value={Math.round((element as IWallElement).startPoint.y)} readOnly />
          </div>
          {'thickness' in element && (
            <div>
              <label className="text-2xs text-surface-400 uppercase tracking-wider block mb-1">Thickness (mm)</label>
              <input className="prop-input" type="number" defaultValue={(element as IWallElement).thickness} />
            </div>
          )}
          {'height' in element && (
            <div>
              <label className="text-2xs text-surface-400 uppercase tracking-wider block mb-1">Height (mm)</label>
              <input className="prop-input" type="number" defaultValue={(element as IWallElement).height} />
            </div>
          )}
          <button
            id="btn-delete-element"
            className="w-full mt-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            onClick={() => {
              dispatch(new DeleteElementCommand(element.id))
            }}
          >
            Delete Element
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Layers Panel ─────────────────────────────────────────────────────────

function LayersPanel() {
  const { layersPanelOpen, toggleLayersPanel } = useUIStore()
  const { layers } = useSceneStore()
  if (!layersPanelOpen) return null

  return (
    <div className="glass-panel rounded-xl w-56 animate-scale-in z-20 p-2">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-semibold text-surface-300">Layers</span>
        <button onClick={toggleLayersPanel} className="text-surface-500 hover:text-surface-300 text-sm">✕</button>
      </div>
      {layers.map(layer => (
        <div key={layer.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-700/50 cursor-pointer group">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: layer.color }} />
          <span className="text-xs text-surface-300 flex-1">{layer.name}</span>
          <button
            className="opacity-0 group-hover:opacity-100 text-surface-500 hover:text-surface-300 text-xs"
            onClick={() => sceneGraph.updateLayer(layer.id, { visible: !layer.visible })}
          >
            {layer.visible ? '👁' : '🙈'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Status Bar ───────────────────────────────────────────────────────────

function StatusBar({ snapInfo }: { snapInfo: string }) {
  const { activeTool } = useToolStore()
  const { zoom } = useViewStore()
  const { version } = useSceneStore()
  const wallCount = sceneGraph.getElementsByType('wall').length

  return (
    <div className="glass-panel rounded-lg px-4 py-1.5 flex items-center gap-6 text-xs text-surface-400 z-10">
      <span>Tool: <span className="text-surface-200 font-medium capitalize">{activeTool}</span></span>
      <span>Walls: <span className="text-surface-200 font-medium">{wallCount}</span></span>
      <span>Zoom: <span className="text-surface-200 font-medium">{Math.round(zoom * 100)}%</span></span>
      {snapInfo && <span className="text-primary-400">⌖ {snapInfo}</span>}
      <span className="ml-auto text-2xs text-surface-600">BuildFlow v2.0 — Architecture Modeling Platform</span>
    </div>
  )
}

// ─── 2D Canvas ────────────────────────────────────────────────────────────

function Canvas2D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<IPoint | null>(null)
  const [cursorPos, setCursorPos] = useState<IPoint>({ x: 0, y: 0 })
  const [snapInfo, setSnapInfo] = useState('')

  const { activeTool, toolOptions } = useToolStore()
  const { version } = useSceneStore()
  const { selectedIds, select, clearSelection } = useSelectionStore()
  const { zoom, panX, panY, setZoom, setPan } = useViewStore()
  const { settings: snapSettings, guides } = useSnapStore()
  const { unitSystem } = useMeasurementStore()
  const { dispatch } = useCommand()

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ w: width, h: height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // World ↔ canvas coordinate transforms
  const toWorld = useCallback((p: IPoint): IPoint => ({
    x: (p.x - size.w / 2 - panX) / zoom,
    y: (p.y - size.h / 2 - panY) / zoom,
  }), [size, panX, panY, zoom])

  const toCanvas = useCallback((p: IPoint): IPoint => ({
    x: p.x * zoom + size.w / 2 + panX,
    y: p.y * zoom + size.h / 2 + panY,
  }), [size, panX, panY, zoom])

  // Resolve snap
  const resolveSnap = useCallback((rawWorld: IPoint, origin?: IPoint) => {
    const walls = sceneGraph.getAllWalls()
    return snapManager.resolve(rawWorld, walls, snapSettings, guides, origin)
  }, [snapSettings, guides])

  // Mouse handlers
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return

    const worldRaw = toWorld({ x: pos.x, y: pos.y })
    const snap = resolveSnap(worldRaw, drawStart ?? undefined)
    const snapped = snap.point

    setCursorPos(snapped)
    if (snap.snapped) {
      setSnapInfo(`${snap.snapType} (${Math.round(snapped.x)}, ${Math.round(snapped.y)})`)
    } else {
      setSnapInfo('')
    }
  }, [toWorld, resolveSnap, drawStart])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage() && e.target.getClassName() !== 'Rect') {
      // Hit a shape — selection handled by shape click
      return
    }

    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    const worldRaw = toWorld({ x: pos.x, y: pos.y })
    const snap = resolveSnap(worldRaw)
    const pt = snap.point

    if (activeTool === 'wall') {
      if (!isDrawing) {
        setDrawStart(pt)
        setIsDrawing(true)
      } else if (drawStart) {
        const cmd = new AddWallCommand(drawStart, pt, 'layer-walls', {
          thickness: Number(toolOptions.wallThickness) || 200,
          height:    Number(toolOptions.wallHeight)    || 2700,
        })
        dispatch(cmd)
        // Continue wall chain from this endpoint
        setDrawStart(pt)
      }
    } else if (activeTool === 'select') {
      clearSelection()
    }
  }, [activeTool, isDrawing, drawStart, toWorld, resolveSnap, dispatch, clearSelection, toolOptions])

  const handleDoubleClick = useCallback(() => {
    if (activeTool === 'wall' && isDrawing) {
      setIsDrawing(false)
      setDrawStart(null)
    }
  }, [activeTool, isDrawing])

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const delta = e.evt.deltaY > 0 ? 0.9 : 1.1
    setZoom(zoom * delta)
  }, [zoom, setZoom])

  // Collect render data
  const walls = sceneGraph.getAllWalls()
  const rooms = sceneGraph.getElementsByType<any>('room')

  return (
    <div ref={containerRef} className="flex-1 canvas-bg canvas-bg-small relative overflow-hidden">
      <Stage
        width={size.w}
        height={size.h}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onDblClick={handleDoubleClick}
        onWheel={handleWheel}
        style={{ cursor: activeTool === 'wall' ? 'crosshair' : activeTool === 'pan' ? 'grab' : 'default' }}
      >
        <Layer>
          {/* Grid origin cross */}
          {(() => {
            const origin = toCanvas({ x: 0, y: 0 })
            return (
              <>
                <Line points={[origin.x - 12, origin.y, origin.x + 12, origin.y]} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
                <Line points={[origin.x, origin.y - 12, origin.x, origin.y + 12]} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
              </>
            )
          })()}

          {/* Rooms */}
          {rooms.map((room: any) => (
            <Group key={room.id}>
              {/* Room fill - simplified for now */}
            </Group>
          ))}

          {/* Walls */}
          {walls.map(wall => {
            const seg = new Segment(Point.from(wall.startPoint), Point.from(wall.endPoint))
            const poly = wallOffsetPolygon(seg, wall.thickness / 2)
            const verts = poly.vertices
            const pts = verts.flatMap(v => {
              const c = toCanvas(v)
              return [c.x, c.y]
            })
            const isSelected = selectedIds.has(wall.id)
            const cs = toCanvas(wall.startPoint)
            const ce = toCanvas(wall.endPoint)

            return (
              <Group key={wall.id}>
                {/* Wall body */}
                <Line
                  points={[...pts, pts[0], pts[1]]}
                  closed
                  fill={isSelected ? 'rgba(99,102,241,0.15)' : '#1e293b'}
                  stroke={isSelected ? '#818cf8' : '#475569'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  onClick={() => select(wall.id)}
                  onMouseEnter={e => { e.target.strokeWidth(2); e.target.getLayer()?.batchDraw() }}
                  onMouseLeave={e => { e.target.strokeWidth(isSelected ? 2 : 1.5); e.target.getLayer()?.batchDraw() }}
                />
                {/* Wall centerline */}
                <Line
                  points={[cs.x, cs.y, ce.x, ce.y]}
                  stroke="rgba(99,102,241,0.2)"
                  strokeWidth={0.5}
                  dash={[4, 4]}
                  listening={false}
                />
                {/* Wall length label */}
                {zoom > 0.5 && (() => {
                  const mid = { x: (cs.x + ce.x) / 2, y: (cs.y + ce.y) / 2 }
                  const len = seg.length
                  return (
                    <Text
                      x={mid.x - 30} y={mid.y - 16}
                      text={formatLength(len, 'm', 2)}
                      fontSize={10} fill="#64748b"
                      listening={false}
                    />
                  )
                })()}
              </Group>
            )
          })}

          {/* Live drawing preview */}
          {isDrawing && drawStart && (() => {
            const cs = toCanvas(drawStart)
            const ce = toCanvas(cursorPos)
            const seg = new Segment(Point.from(drawStart), Point.from(cursorPos))
            const poly = wallOffsetPolygon(seg, (Number(toolOptions.wallThickness) || 200) / 2)
            const pts = poly.vertices.flatMap(v => { const c = toCanvas(v); return [c.x, c.y] })
            const len = seg.length

            return (
              <>
                <Line
                  points={[...pts, pts[0], pts[1]]}
                  closed
                  fill="rgba(99,102,241,0.1)"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  dash={[6, 3]}
                  listening={false}
                />
                {/* Snap indicator */}
                <Circle x={ce.x} y={ce.y} radius={5} fill="#6366f1" opacity={0.9} listening={false} />
                <Circle x={cs.x} y={cs.y} radius={4} fill="#4f46e5" opacity={0.7} listening={false} />
                {/* Length label */}
                <Text
                  x={(cs.x + ce.x) / 2 + 8}
                  y={(cs.y + ce.y) / 2 - 20}
                  text={formatLength(len, 'm', 2)}
                  fontSize={11}
                  fill="#818cf8"
                  fontStyle="bold"
                  listening={false}
                />
              </>
            )
          })()}
        </Layer>
      </Stage>

      {/* Status bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <StatusBar snapInfo={snapInfo} />
      </div>

      {/* Tool hint */}
      {activeTool === 'wall' && !isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel rounded-lg px-4 py-2 text-xs text-surface-300 pointer-events-none animate-fade-in">
          Click to start drawing a wall · Double-click to end
        </div>
      )}
      {activeTool === 'wall' && isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel rounded-lg px-4 py-2 text-xs text-primary-300 pointer-events-none animate-fade-in">
          Click to continue wall · Double-click to finish
        </div>
      )}
    </div>
  )
}

// ─── 3D Placeholder ───────────────────────────────────────────────────────

function Canvas3D() {
  return (
    <div className="flex-1 flex items-center justify-center canvas-bg">
      <div className="glass-panel rounded-2xl p-12 text-center max-w-sm">
        <div className="text-5xl mb-4 opacity-60">🏗</div>
        <h3 className="text-lg font-semibold text-surface-200 mb-2">3D View</h3>
        <p className="text-surface-400 text-sm">
          Three.js / React Three Fiber 3D engine mounts here.
          Press <kbd className="bg-surface-700 rounded px-1.5 py-0.5 text-xs mx-1">3</kbd> to return to 2D.
        </p>
      </div>
    </div>
  )
}

// ─── AI Panel ─────────────────────────────────────────────────────────────

function AIPanel() {
  const { aiPanelOpen, toggleAIPanel } = useUIStore()
  const [prompt, setPrompt] = useState('')

  if (!aiPanelOpen) return null

  return (
    <div className="glass-panel rounded-xl w-80 absolute right-72 top-0 animate-scale-in z-20 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-surface-700">
        <span className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          <span className="text-primary-400">✦</span> AI Generator
        </span>
        <button onClick={toggleAIPanel} className="text-surface-500 hover:text-surface-300">✕</button>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <label className="text-2xs text-surface-400 uppercase tracking-wider block mb-1">Describe your floor plan</label>
          <textarea
            className="prop-input resize-none h-24 text-sm"
            placeholder="e.g. 3-bedroom bungalow with open kitchen/living, master bedroom with en-suite..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>
        <select className="prop-input text-sm">
          <option>Bungalow</option>
          <option>Duplex</option>
          <option>Apartment</option>
          <option>Office</option>
        </select>
        <button
          id="btn-ai-generate"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-glow-primary"
        >
          Generate Floor Plan
        </button>
        <p className="text-2xs text-surface-500 text-center">AI generation requires API configuration in server settings</p>
      </div>
    </div>
  )
}

// ─── Export Panel ─────────────────────────────────────────────────────────

function ExportPanel() {
  const { exportPanelOpen, toggleExportPanel } = useUIStore()
  if (!exportPanelOpen) return null

  const formats = ['PDF', 'PNG', 'SVG', 'OBJ', 'GLB', 'STL']

  return (
    <div className="glass-panel rounded-xl w-64 absolute right-72 top-0 animate-scale-in z-20">
      <div className="flex items-center justify-between p-3 border-b border-surface-700">
        <span className="text-sm font-semibold text-surface-200">Export</span>
        <button onClick={toggleExportPanel} className="text-surface-500 hover:text-surface-300">✕</button>
      </div>
      <div className="p-3 space-y-2">
        {formats.map(fmt => (
          <button
            key={fmt}
            id={`btn-export-${fmt.toLowerCase()}`}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm text-surface-300 transition-colors"
          >
            <span>{fmt}</span>
            <span className="text-surface-500 text-xs">⤓</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Template Library ─────────────────────────────────────────────────────

function TemplateLibrary() {
  const { templateLibraryOpen, toggleTemplateLibrary } = useUIStore()
  if (!templateLibraryOpen) return null

  const MOCK = [
    { id: '1', name: '2-Bed Bungalow',   category: 'Residential', icon: '🏠' },
    { id: '2', name: 'Studio Apartment',  category: 'Residential', icon: '🏢' },
    { id: '3', name: 'Open Office',       category: 'Commercial',  icon: '🏬' },
    { id: '4', name: 'Restaurant Layout', category: 'Commercial',  icon: '🍽️' },
  ]

  return (
    <div className="glass-panel rounded-xl w-72 absolute left-16 top-0 animate-scale-in z-20">
      <div className="flex items-center justify-between p-3 border-b border-surface-700">
        <span className="text-sm font-semibold text-surface-200">Template Library</span>
        <button onClick={toggleTemplateLibrary} className="text-surface-500 hover:text-surface-300">✕</button>
      </div>
      <div className="p-2">
        <input className="prop-input mb-2" placeholder="Search templates..." />
        <div className="grid grid-cols-2 gap-2">
          {MOCK.map(t => (
            <div
              key={t.id}
              id={`template-${t.id}`}
              className="bg-surface-800 rounded-lg p-3 cursor-pointer hover:bg-surface-700 hover:border-primary-500/30 border border-transparent transition-all"
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-xs font-medium text-surface-200">{t.name}</div>
              <div className="text-2xs text-surface-500">{t.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────

export function App() {
  useShortcuts()
  const { mode } = useViewStore()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-950">
      {/* Header */}
      <header className="glass-panel border-b border-surface-800 px-4 py-2 flex items-center gap-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="font-semibold text-surface-100 text-sm">BuildFlow</span>
          <span className="text-surface-600 text-xs ml-1">v2.0</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-surface-500">
          <span>Untitled Project</span>
          <span>·</span>
          <span className="capitalize">{mode === '2d' ? 'Floor Plan' : '3D View'}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Presence avatars */}
          <div className="flex items-center -space-x-1">
            <div className="w-7 h-7 rounded-full bg-primary-600 border-2 border-surface-900 flex items-center justify-center text-xs text-white font-bold">R</div>
          </div>
          <button id="btn-save" className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-glow-primary">
            Save
          </button>
          <button id="btn-share" className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-700 hover:bg-surface-600 text-surface-200 transition-colors">
            Share
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar */}
        <div className="flex-shrink-0 p-2 flex flex-col z-10">
          <Toolbar />
        </div>

        {/* Canvas */}
        {mode === '2d' ? <Canvas2D /> : <Canvas3D />}

        {/* Right Properties Panel */}
        <div className="flex-shrink-0 p-2 flex flex-col z-10">
          <PropertiesPanel />
        </div>

        {/* Floating panels */}
        <div className="absolute top-2 left-16 z-20">
          <TemplateLibrary />
        </div>
        <div className="absolute top-2 right-72 z-20">
          <AIPanel />
          <ExportPanel />
        </div>
        <div className="absolute bottom-12 left-16 z-20">
          <LayersPanel />
        </div>
      </div>
    </div>
  )
}
